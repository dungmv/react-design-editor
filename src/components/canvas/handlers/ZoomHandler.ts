import { fabric } from 'fabric';

import Handler from './Handler';

class ZoomHandler {
    handler?: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
    }

    /**
     * Zoom to point
     * @param {fabric.Point} point
     * @param {number} zoom
     */
    public zoomToPoint = (point: fabric.Point, zoom: number) => {
        const { minZoom, maxZoom } = this.handler;
        let zoomRatio = zoom;
        if (zoom <= (minZoom / 100)) {
            zoomRatio = minZoom / 100;
        } else if (zoom >= (maxZoom / 100)) {
            zoomRatio = maxZoom / 100;
        }
        this.handler.canvas.zoomToPoint(point, zoomRatio);
        if (this.handler.onZoom) {
            this.handler.onZoom(zoomRatio);
        }
    }

    /**
     * Zoom one to one
     */
    public zoomOneToOne = () => {
        const center = this.handler.canvas.getCenter();
        this.handler.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.zoomToPoint(new fabric.Point(center.left, center.top), 1);
    }

    /**
     * Zoom to fit
     */
    public zoomToFit = () => {
        let width = this.handler.workarea.width * this.handler.workarea.scaleX;
        let height = this.handler.workarea.height * this.handler.workarea.scaleY;
        let scaleX = this.handler.canvas.getWidth() / width;
        let scaleY = this.handler.canvas.getHeight() / height;
        if (height > width) {
            scaleX = scaleY;
            if (this.handler.canvas.getWidth() < width * scaleX) {
                scaleX = scaleX * (this.handler.canvas.getWidth() / (width * scaleX));
            }
        } else {
            scaleY = scaleX;
            if (this.handler.canvas.getHeight() < height * scaleX) {
                scaleX = scaleX * (this.handler.canvas.getHeight() / (height * scaleX));
            }
        }
        const center = this.handler.canvas.getCenter();
        this.handler.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
    }

    /**
     * Zoom in
     */
    public zoomIn = () => {
        let zoomRatio = this.handler.canvas.getZoom();
        zoomRatio += 0.05;
        const center = this.handler.canvas.getCenter();
        this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    }

    /**
     * Zoom out
     */
    public zoomOut = () => {
        let zoomRatio = this.handler.canvas.getZoom();
        zoomRatio -= 0.05;
        const center = this.handler.canvas.getCenter();
        this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    }
}

export default ZoomHandler;
