import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import classnames from 'classnames';

import NodeProperties from './properties/NodeProperties';
import MapProperties from './properties/MapProperties';
import Icon from '../icon/Icon';
import CommonButton from '../common/CommonButton';

class ImageMapConfigurations extends Component {
    static propTypes = {
        canvasRef: PropTypes.any,
        selectedItem: PropTypes.object,
        onChange: PropTypes.func
    }

    state = {
        activeKey: 'map',
    }

    handlers = {
        onChangeTab: (activeKey) => {
            this.setState({
                activeKey,
            });
        },
        onCollapse: () => {
            this.setState({
                collapse: !this.state.collapse,
            });
        },
    }

    render() {
        const {
            onChange,
            selectedItem,
            canvasRef
        } = this.props;
        const { collapse, activeKey } = this.state;
        const { onChangeTab, onCollapse } = this.handlers;
        const className = classnames('rde-editor-configurations', {
            minimize: collapse,
        });
        return (
            <div className={className}>
                <CommonButton
                    className="rde-action-btn"
                    shape="circle"
                    icon={collapse ? 'angle-double-left' : 'angle-double-right'}
                    onClick={onCollapse}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}
                />
                <Tabs
                    tabPosition="right"
                    style={{ height: '100%' }}
                    activeKey={activeKey}
                    onChange={onChangeTab}
                    tabBarStyle={{ marginTop: 60 }}
                >
                    <Tabs.TabPane tab={<Icon name="cog" />} key="map">
                        <MapProperties onChange={onChange} canvasRef={canvasRef} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab={<Icon name="cogs" />} key="node">
                        <NodeProperties onChange={onChange} selectedItem={selectedItem} canvasRef={canvasRef} />
                    </Tabs.TabPane>
                </Tabs>
            </div>
        );
    }
}

export default ImageMapConfigurations;
