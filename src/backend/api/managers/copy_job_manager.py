import json
import logging
import datetime

from flask import request

from .. import tasks
from ..application import db
from ..exceptions import *
from ..models import CopyJob, CloudConnection
from ..rclone.rclone_connection import RcloneConnection
from ..managers.auth_manager import token_required, get_logged_in_user


@token_required
def list():
    owner = get_logged_in_user(request)

    copy_jobs = CopyJob.query.filter_by(owner=owner).all()

    for copy_job in copy_jobs:
        try:
            task = tasks.copy_job.AsyncResult(str(copy_job.id))
            copy_job.progress_text = task.info.get('text', '')
        except Exception:
            pass # Sometimes rabbitmq closes the connection!

    return copy_jobs


@token_required
def create(data):
    owner = get_logged_in_user(request)

    copy_job = CopyJob(**{
        'description': data.get('description', None),
        'src_cloud_id': data.get('src_cloud_id', None),
        'src_resource': data.get('src_resource', None),
        'dst_cloud_id': data.get('dst_cloud_id', None),
        'dst_path': data.get('dst_path', None),
        'progress_current': 0,
        'progress_total': 100,
        'progress_state': "PROGRESS",
        'owner': owner
    })

    db.session.add(copy_job)
    db.session.commit()

    task_id = copy_job.id
    tasks.copy_job.apply_async(task_id=str(task_id), kwargs={
        'task_id': task_id,
    })

    return copy_job


@token_required
def retrieve(id):
    copy_job = CopyJob.query.get(id)

    if copy_job is None:
        raise HTTP_404_NOT_FOUND('Copy Job with id {} not found'.format(id))

    owner = get_logged_in_user(request)

    if copy_job.owner != owner:
        raise HTTP_404_NOT_FOUND('Copy Job with id {} not found'.format(id))

    try:
        task = tasks.copy_job.AsyncResult(str(copy_job.id))
        copy_job.progress_text = task.info.get('text', '')
    except Exception:
        pass # Sometimes rabbitmq closes the connection!

    return copy_job


@token_required
def stop(id):
    copy_job = retrieve(id)

    task = tasks.copy_job.AsyncResult(str(copy_job.id))
    task.revoke(terminate=True)

    copy_job = CopyJob.query.get(id) # Avoid race conditions
    if copy_job.progress_state != 'FINISHED':
        copy_job.progress_state = 'STOPPED'
        db.session.commit()

    return copy_job
