import React from 'react';
import upath from 'upath';

import PaneFile from 'views/App/Pane/PaneFile.jsx'

class Pane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {pane} = this.props;

        const paneFiles = this.props.files.map((file, i) => (
            <PaneFile
                key={i}
                type={file.type}
                name={file.name}
                size={file.size}
                active={this.props.active && i === pane.fileFocusIndex}
                onMouseDown={() => this.props.onSelect(this.props.side, i)}
                onDoubleClick={() => this.onEnter(this.props.side, i)}
            />
        ))

        return (
            <div className='grid-files'>
                {paneFiles}
            </div>
        );
    }

    componentDidMount() {

    }

    onEnter(side, index) {
        const currPath = this.props.pane.path;
        const directoryToEnter = this.props.files[index]
        if (directoryToEnter.type !== 'dir') {
            return; // We do not open files
        }

        const path = upath.join(currPath, directoryToEnter.name)
        this.props.onDirectoryChange(side, path)
    }
}

Pane.defaultProps = {
    side: 'left',
    files: [],
    pane: {},
    active: false,
    onSelect: (side, index) => {},
}

import {connect} from 'react-redux';
import {fileFocusIndex, directoryChange} from 'actions/paneActions.jsx';

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    onSelect: (side, index) => dispatch(fileFocusIndex(side, index)),
    onDirectoryChange: (side, path) => dispatch(directoryChange(side, path))
});

export default connect(mapStateToProps, mapDispatchToProps)(Pane);
