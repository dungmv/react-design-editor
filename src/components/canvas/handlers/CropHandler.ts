import { fabric } from 'fabric';

import { Handler } from '.';
import { FabricImage } from '../utils';

class CropHandler {
    handler: Handler;
    cropRect: fabric.Rect;
    cropRectPrev: fabric.Rect;
    cropObject: FabricImage;

    constructor(handler: Handler) {
        this.handler = handler;
        this.cropRect = null;
        this.cropRectPrev = null;
        this.cropObject = null;
    }

    /**
     * Validate crop type
     * @returns
     */
    public validType = () => {
        const activeObject = this.handler.canvas.getActiveObject();
        if (!activeObject) {
            return false;
        }
        if (activeObject.type === 'image') {
            return true;
        }
        return false;
    }

    /**
     * Start crop image
     */
    public start = () => {
        if (this.validType()) {
            this.handler.interactionMode = 'crop';
            this.cropObject = this.handler.canvas.getActiveObject() as FabricImage;
            this.cropRect = new fabric.Rect({
                angle: this.cropObject.angle,
                left: this.cropObject.left,
                top: this.cropObject.top,
                originX: 'left',
                originY: 'top',
                hasRotatingPoint: false,
                fill: 'rgba(0, 0, 0, 0.2)',
            });
            this.cropRect.width = this.cropObject.width * this.cropObject.scaleX;
            this.cropRect.height = this.cropObject.height * this.cropObject.scaleY;
            this.cropRectPrev = this.cropObject.clipPath;
            this.handler.canvas.add(this.cropRect);
            this.handler.canvas.setActiveObject(this.cropRect);
            this.cropObject.selectable = false;
            this.cropObject.evented = false;
            this.cropObject.dirty = true;
            this.cropObject.clipPath = null;
            this.handler.canvas.renderAll();
        }
    }

    /**
     * Finish crop image
     */
    public finish = () => {
        const { left, top, width, height, scaleX, scaleY } = this.cropRect;
        const diffLeft = left - this.cropObject.left;
        const diffTop = top - this.cropObject.top;
        this.cropObject.clipPath = new fabric.Rect({
            left: diffLeft / this.cropObject.scaleX - this.cropObject.width / 2,
            top: diffTop / this.cropObject.scaleY - this.cropObject.height / 2,
            width: width * scaleX / this.cropObject.scaleX,
            height: height * scaleY / this.cropObject.scaleY
        });
        this.cropObject.dirty = true;
        this.clean();
    }

    /**
     * Cancel crop
     */
    cancel = () => {
        this.cropObject.clipPath = this.cropRectPrev;
        this.cropObject.dirty = true;
        this.clean();
    }

    /**
     * clean up before close
     */
    clean = () => {
        this.handler.interactionMode = 'selection';
        this.cropObject.selectable = true;
        this.cropObject.evented = true;
        this.handler.canvas.setActiveObject(this.cropObject);
        this.handler.canvas.remove(this.cropRect);
        this.cropRect = null;
        this.cropObject = null;
        this.cropRectPrev = null;
        this.handler.canvas.renderAll();
    }

    /**
     * Resize crop
     * @param {FabricEvent} opt
     */
    resize = (opt: fabric.IEvent) => {
        const { target, transform: { original, corner } } = opt;
        const { left, top, width, height, scaleX, scaleY } = target;
        const { left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight, scaleX: cropScaleX, scaleY: cropScaleY } = this.cropObject;
        if (corner === 'tl') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'bl') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
            if (Math.round(cropTop + (cropHeight * cropScaleY)) < Math.round(top + (height * scaleY))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'tr') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'br') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
            if (Math.round(cropTop + (cropHeight * cropScaleY)) < Math.round(top + (height * scaleY))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'ml') {
            if (Math.round(cropLeft) > Math.round(left)) { // left
                const originRight = Math.round(cropLeft + cropWidth);
                const targetRight = Math.round(target.getBoundingRect().left + target.getBoundingRect().width);
                const diffRightRatio = 1 - ((originRight - targetRight) / cropWidth);
                target.set({
                    left: cropLeft,
                    scaleX: diffRightRatio > 1 ? 1 : diffRightRatio,
                });
            }
        } else if (corner === 'mt') {
            if (Math.round(cropTop) > Math.round(top)) { // top
                const originBottom = Math.round(cropTop + cropHeight);
                const targetBottom = Math.round(target.getBoundingRect().top + target.getBoundingRect().height);
                const diffBottomRatio = 1 - ((originBottom - targetBottom) / cropHeight);
                target.set({
                    top: cropTop,
                    scaleY: diffBottomRatio > 1 ? 1 : diffBottomRatio,
                });
            }
        } else if (corner === 'mb') {
            if (Math.round(cropTop + (cropHeight * cropScaleY)) < Math.round(top + (height * scaleY))) { // bottom
                const diffTopRatio = 1 - ((original.top - cropTop) / cropHeight);
                target.set({
                    top: original.top,
                    scaleY: diffTopRatio > 1 ? 1 : diffTopRatio,
                });
            }
        } else if (corner === 'mr') {
            if (Math.round(cropLeft + (cropWidth * cropScaleX)) < Math.round(left + (width * scaleX))) { // right
                const diffLeftRatio = 1 - ((original.left - cropLeft) / cropWidth);
                target.set({
                    left: original.left,
                    scaleX: diffLeftRatio > 1 ? 1 : diffLeftRatio,
                });
            }
        }
    }

    /**
     * Resize crop
     * @param {FabricEvent} opt
     */
    moving = (opt: fabric.IEvent) => {
        const { target } = opt;
        const { left, top, width, height, scaleX, scaleY } = target;
        const { left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight } = this.cropObject.getBoundingRect();
        const movedTop = () => {
            if (Math.round(cropTop) >= Math.round(top)) {
                target.set({
                    top: cropTop,
                });
            } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
                target.set({
                    top: cropTop + cropHeight - (height * scaleY),
                });
            }
        };
        if (Math.round(cropLeft) >= Math.round(left)) {
            target.set({
                left: Math.max(left, cropLeft),
            });
            movedTop();
        } else if (Math.round(cropLeft + cropWidth) <= Math.round(left + (width * scaleX))) {
            target.set({
                left: cropLeft + cropWidth - (width * scaleX),
            });
            movedTop();
        } else if (Math.round(cropTop) >= Math.round(top)) {
            target.set({
                top: cropTop,
            });
        } else if (Math.round(cropTop + cropHeight) <= Math.round(top + (height * scaleY))) {
            target.set({
                top: cropTop + cropHeight - (height * scaleY),
            });
        }
    }
}

export default CropHandler;
