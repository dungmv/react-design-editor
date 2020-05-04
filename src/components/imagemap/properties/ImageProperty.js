import React from 'react';
import { Form, Radio } from 'antd';

import UrlModal from '../../common/UrlModal';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        return (
            <React.Fragment>
                <Form.Item>
                    {
                        getFieldDecorator('src', {
                            initialValue: data.src,
                        })(
                            <UrlModal form={form} />,
                        )
                    }
                </Form.Item>
            </React.Fragment>
        );
    },
};
