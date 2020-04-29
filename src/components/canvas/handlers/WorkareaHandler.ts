import { fabric } from 'fabric';

import { Handler } from '.';
import { WorkareaObject, FabricElement } from '../utils';

const defaultWorkareaOption: Partial<WorkareaObject> = {
    width: 600,
    height: 400,
    workareaWidth: 600,
    workareaHeight: 400,
    lockScalingX: true,
    lockScalingY: true,
    scaleX: 1,
    scaleY: 1,
    backgroundColor: '#fff',
    hasBorders: false,
    hasControls: false,
    selectable: false,
    lockMovementX: true,
    lockMovementY: true,
    hoverCursor: 'default',
    name: '',
    id: 'workarea',
    type: 'image',
};

class WorkareaHandler {
    handler: Handler;

    constructor(handler: Handler) {
        this.handler = handler;
        this.init();
    }

    /**
     * Init workarea
     */
    public init = () => {
        const { workareaOption } = this.handler;
        const mergedWorkareaOption = Object.assign({}, defaultWorkareaOption, workareaOption);
        const image = new Image(mergedWorkareaOption.width, mergedWorkareaOption.height);
        image.width = mergedWorkareaOption.width;
        image.height = mergedWorkareaOption.height;
        this.handler.workarea = new fabric.Image(image, mergedWorkareaOption) as WorkareaObject;
        this.handler.canvas.add(this.handler.workarea);
        this.handler.objects = this.handler.getObjects();
        this.handler.canvas.centerObject(this.handler.workarea);
        this.handler.canvas.renderAll();
    }

    /**
     * Set the responsive image on Workarea
     * @param {string | File} [source]
     * @param {boolean} [loaded]
     * @returns
     */
    public setResponsiveImage = (source: string | File, loaded?: boolean) => {
        const { canvas, workarea, editable } = this.handler;
        const imageFromUrl = (src: string) => {
            fabric.Image.fromURL(src, (img: any) => {
                let scaleX = canvas.getWidth() / img.width;
                let scaleY = canvas.getHeight() / img.height;
                if (img.height >= img.width) {
                    scaleX = scaleY;
                    if (canvas.getWidth() < img.width * scaleX) {
                        scaleX = scaleX * (canvas.getWidth() / (img.width * scaleX));
                    }
                } else {
                    scaleY = scaleX;
                    if (canvas.getHeight() < img.height * scaleX) {
                        scaleX = scaleX * (canvas.getHeight() / (img.height * scaleX));
                    }
                }
                img.set({
                    originX: 'left',
                    originY: 'top',
                });
                if (!img._element) {
                    workarea.setElement(new Image());
                    workarea.set({
                        isElement: false,
                        selectable: false,
                    });
                } else {
                    workarea.set({
                        ...img,
                        isElement: true,
                        selectable: false,
                    });
                }
                if (!src) {
                    scaleX = 1;
                }
                canvas.centerObject(workarea);
                if (editable && !loaded) {
                    canvas.getObjects().forEach(obj => {
                        const { id } = obj as FabricElement;
                        if (id !== 'workarea') {
                            obj.set({
                                scaleX: 1,
                                scaleY: 1,
                            });
                            obj.setCoords();
                        }
                    });
                }
                const center = canvas.getCenter();
                canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), scaleX);
                canvas.renderAll();
            });
        };
        if (!source) {
            workarea.set({
                src: null,
                file: null,
            });
            imageFromUrl(source as string);
            return;
        }
        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = () => {
                workarea.set({
                    file: source,
                });
                imageFromUrl(reader.result as string);
            };
            reader.readAsDataURL(source);
        } else {
            workarea.set({
                src: source,
            });
            imageFromUrl(source);
        }
    }

    /**
     * Set the image on Workarea
     * @param {string | File} source
     * @param {boolean} [loaded=false]
     * @returns
     */
    setImage = (source: string | File, loaded = false) => {
        const { canvas, workarea, editable } = this.handler;

        const imageFromUrl = (src: string) => {
            fabric.Image.fromURL(src, (img: any) => {
                let width = canvas.getWidth();
                let height = canvas.getHeight();
                width = workarea.width * workarea.scaleX;
                height = workarea.height * workarea.scaleY;
                let scaleX = 1;
                let scaleY = 1;
                if (img._element) {
                    scaleX = width / img.width;
                    scaleY = height / img.height;
                    img.set({
                        originX: 'left',
                        originY: 'top',
                        scaleX,
                        scaleY,
                    });
                    workarea.set({
                        ...img,
                        isElement: true,
                        selectable: false,
                    });
                } else {
                    workarea.setElement(new Image());
                    workarea.set({
                        width,
                        height,
                        scaleX,
                        scaleY,
                        isElement: false,
                        selectable: false,
                    });
                }
                canvas.centerObject(workarea);
                if (editable && !loaded) {
                    canvas.getObjects().forEach(obj => {
                        const { id } = obj as FabricElement;
                        if (id !== 'workarea') {
                            scaleX = 1;
                            scaleY = 1;
                            obj.set({ scaleX, scaleY });
                            obj.setCoords();
                        }
                    });
                }
                const center = canvas.getCenter();
                canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                this.handler.zoomHandler.zoomToPoint(new fabric.Point(center.left, center.top), 1);
                canvas.renderAll();
            });
        };
        if (!source) {
            workarea.set({
                src: null,
                file: null,
            });
            // imageFromUrl(source as string);
            imageFromUrl('./images/sample/blank.png');
            return;
        }
        if (source instanceof File) {
            const reader = new FileReader();
            reader.onload = () => {
                workarea.set({
                    file: source,
                });
                imageFromUrl(reader.result as string);
            };
            reader.readAsDataURL(source);
        } else {
            workarea.set({
                src: source,
            });
            imageFromUrl(source);
        }
    }
}

export default WorkareaHandler;
