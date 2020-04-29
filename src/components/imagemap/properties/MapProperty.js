import React from 'react';
import { Form, Input, Radio, Row, Col, InputNumber } from 'antd';
import i18n from 'i18next';

export default {
    render(canvasRef, form, data) {
        const { getFieldDecorator } = form;
        if (!data) {
            return null;
        }
        return (
            <React.Fragment>
                <Form.Item label={i18n.t('common.name')} colon={false}>
                    {
                        getFieldDecorator('name', {
                            rules: [{
                                required: false,
                                message: i18n.t('validation.enter-arg', { arg: i18n.t('common.name') }),
                            }],
                            initialValue: data.name || '',
                        })(
                            <Input />,
                        )
                    }
                </Form.Item>
                <React.Fragment>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={i18n.t('common.width')} colon={false}>
                                {
                                    getFieldDecorator('width', {
                                        rules: [{
                                            required: true,
                                            message: i18n.t('validation.enter-arg', { arg: i18n.t('common.width') }),
                                        }],
                                        initialValue: data.width * data.scaleX,
                                    })(
                                        <InputNumber />,
                                    )
                                }
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={i18n.t('common.height')} colon={false}>
                                {
                                    getFieldDecorator('height', {
                                        rules: [{
                                            required: true,
                                            message: i18n.t('validation.enter-arg', { arg: i18n.t('common.height') }),
                                        }],
                                        initialValue: data.height * data.scaleY,
                                    })(
                                        <InputNumber />,
                                    )
                                }
                            </Form.Item>
                        </Col>
                    </Row>
                </React.Fragment>
            </React.Fragment>
        );
    },
};
