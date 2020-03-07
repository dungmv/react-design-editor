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
        let scaleX;
        let scaleY;
        scaleX = this.handler.canvas.getWidth() / this.handler.workarea.width;
        scaleY = this.handler.canvas.getHeight() / this.handler.workarea.height;
        if (this.handler.workarea.height > this.handler.workarea.width) {
            scaleX = scaleY;
            if (this.handler.canvas.getWidth() < this.handler.workarea.width * scaleX) {
                scaleX = scaleX * (this.handler.canvas.getWidth() / (this.handler.workarea.width * scaleX));
            }
        } else {
            scaleY = scaleX;
            if (this.handler.canvas.getHeight() < this.handler.workarea.height * scaleX) {
                scaleX = scaleX * (this.handler.canvas.getHeight() / (this.handler.workarea.height * scaleX));
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
