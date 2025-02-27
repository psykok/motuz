import React from 'react';
import classnames from 'classnames';
import { Modal, Button } from 'react-bootstrap'

import CloudConnectionDialogFields from 'views/Dialogs/CloudConnectionDialogFields.jsx';
import Icon from 'components/Icon.jsx'
import serializeForm from 'utils/serializeForm.jsx';


class NewCloudConnectionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
    }

    render() {
        const {errors} = this.props
        const {verifySuccess, verifyLoading, verifyFinished} = this.props.data;

        let verificationStatusButton = <div></div>
        if (verifyLoading) {
            verificationStatusButton = (
                <Button
                    variant='outline-warning'
                    className='ml-2'
                    disabled
                >
                    Verifying...
                </Button>
            )
        } else if (verifyFinished && verifySuccess) {
            verificationStatusButton = (
                <Button
                    variant='outline-success'
                    className='ml-2'
                    disabled
                >
                    <Icon name='check'/>
                    <span> Correct </span>
                </Button>
            )
        } else if (verifyFinished && !verifySuccess) {
            verificationStatusButton = (
                <Button
                    variant='outline-danger'
                    className='ml-2'
                    disabled
                >
                    <Icon name='x'/>
                    <span> Incorrect </span>
                </Button>
            )
        }

        return (
            <Modal
                show={true}
                size="lg"
                onHide={() => this.handleClose()}
            >
                <form
                    action="#"
                    onSubmit={event => this.handleSubmit(event)}
                    ref={this.formRef}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>New Cloud Connection</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <CloudConnectionDialogFields
                                data={{
                                    s3_region: 'us-west-2'
                                }}
                                errors={errors}
                                verifySuccess={(verifyFinished && verifySuccess)}
                            />
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="mr-auto">
                            <Button variant="info" onClick={() => this.handleVerify()}>
                                Verify Connection
                            </Button>
                            {verificationStatusButton}
                        </div>

                        <Button variant="secondary" onClick={() => this.handleClose()}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Create Cloud Connection
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }

    handleClose() {
        this.props.onClose();
    }

    handleVerify() {
        const form = this.formRef.current;
        const data = serializeForm(form)

        this.props.onVerify(data);
    }

    handleSubmit(event) {
        event.preventDefault();

        const data = serializeForm(event.target)
        this.props.onSubmit(data);
    }

    componentDidMount() {

    }
}

NewCloudConnectionDialog.defaultProps = {
    errors: {},
    data: {},
    onClose: () => {},
    onSubmit: (data) => {},
    onVerify: (data) => {},
}

import {connect} from 'react-redux';
import {hideNewCloudConnectionDialog} from 'actions/dialogActions.jsx'
import {createCloudConnection, verifyCloudConnection} from 'actions/apiActions.jsx'

const mapStateToProps = state => ({
    errors: state.api.cloudErrors,
    data: state.dialog.newCloudConnectionDialogData,
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(hideNewCloudConnectionDialog()),
    onSubmit: data => dispatch(createCloudConnection(data)),
    onVerify: data => dispatch(verifyCloudConnection(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewCloudConnectionDialog);
