import { fabric } from 'fabric';
import warning from 'warning';
import { v4 } from 'uuid';
import * as changedpi from 'changedpi';

import {
    ImageHandler,
    CropHandler,
    ContextmenuHandler,
    ZoomHandler,
    WorkareaHandler,
    TransactionHandler,
    AlignmentHandler,
    GuidelineHandler,
    GridHandler,
    EventHandler,
    DrawingHandler,
    InteractionHandler,
    ShortcutHandler,
} from '.';
import {
	FabricObject,
	FabricImage,
	WorkareaObject,
	WorkareaOption,
	InteractionMode,
	CanvasOption,
	GridOption,
	GuidelineOption,
	KeyEvent,
	FabricObjectOption,
	FabricElement,
	FabricCanvas,
	FabricGroup,
} from '../utils';
import CanvasObject from '../CanvasObject';
import { TransactionEvent } from './TransactionHandler';

export interface HandlerOptions {
    /**
     * Canvas id
     * @type {string}
     */
    id?: string;
    /**
     * Canvas object
     * @type {FabricCanvas}
     */
    canvas?: FabricCanvas;
    /**
     * Canvas parent element
     * @type {HTMLDivElement}
     */
    container?: HTMLDivElement;
    /**
     * Canvas editable
     * @type {boolean}
     */
    editable?: boolean;
    /**
     * Canvas interaction mode
     * @type {InteractionMode}
     */
    interactionMode?: InteractionMode;
    /**
     * Persist properties for object
     * @type {string[]}
     */
    propertiesToInclude?: string[];
    /**
     * Minimum zoom ratio
     * @type {number}
     */
    minZoom?: number;
    /**
     * Maximum zoom ratio
     * @type {number}
     */
    maxZoom?: number;
    /**
     * Workarea option
     * @type {WorkareaOption}
     */
    workareaOption?: WorkareaOption;
    /**
     * Canvas option
     * @type {CanvasOption}
     */
    canvasOption?: CanvasOption;
    /**
     * Grid option
     * @type {GridOption}
     */
    gridOption?: GridOption;
    /**
     * Default option for Fabric Object
     * @type {FabricObjectOption}
     */
    defaultOption?: FabricObjectOption;
    /**
     * Guideline option
     * @type {GuidelineOption}
     */
    guidelineOption?: GuidelineOption;
    /**
     * Whether to use zoom
     * @type {boolean}
     */
    zoomEnabled?: boolean;
    /**
     * ActiveSelection option
     * @type {FabricObjectOption}
     */
    activeSelection?: FabricObjectOption;
    /**
     * Canvas width
     * @type {number}
     */
    width?: number;
    /**
     * Canvas height
     * @type {number}
     */
    height?: number;
    /**
     * Keyboard event in Canvas
     * @type {KeyEvent}
     */
    keyEvent?: KeyEvent;
    /**
     * Append custom objects
     * @type {{ [key: string]: any }}
     */
    fabricObjects?: {
        [key: string]: {
            create: (...args: any) => FabricObject;
        };
    };
    [key: string]: any;

    /**
     * When has been added object in Canvas, Called function
     */
    onAdd?: (object: FabricObject) => void;
    /**
     * Return contextmenu element
     */
    onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any> | any;
    /**
     * When zoom, Called function
     */
    onZoom?: (zoomRatio: number) => void;
    /**
     * When clicked object, Called function
     */
    onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    /**
     * When double clicked object, Called function
     */
    onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    /**
     * When modified object, Called function
     */
    onModified?: (target: FabricObject) => void;
    /**
     * When select object, Called function
     */
    onSelect?: (target: FabricObject) => void;
    /**
     * When has been removed object in Canvas, Called function
     */
    onRemove?: (target: FabricObject) => void;
    /**
     * When has been undo or redo, Called function
     */
    onTransaction?: (transaction: TransactionEvent) => void;
    /**
     * When has been changed interaction mode, Called function
     */
    onInteraction?: (interactionMode: InteractionMode) => void;
}

/**
 * Main handler for Canvas
 * @class Handler
 * @implements {HandlerOptions}
 */
class Handler implements HandlerOptions {
    public id: string;
    public canvas: FabricCanvas;
    public workarea: WorkareaObject;
    public container: HTMLDivElement;
    public editable: boolean;
    public interactionMode: InteractionMode;
    public propertiesToInclude?: string[];
    public minZoom: number;
    public maxZoom: number;
    public workareaOption?: WorkareaOption;
    public canvasOption?: CanvasOption;
    public gridOption?: GridOption;
    public fabricObjects?: {
        [key: string]: {
            create: (...args: any) => FabricObject;
        };
    };
    public defaultOption?: FabricObjectOption;
    public guidelineOption?: GuidelineOption;
    public zoomEnabled?: boolean;
    public activeSelection?: Partial<FabricObjectOption<fabric.ActiveSelection>>;
    public width?: number;
    public height?: number;
    public keyEvent?: KeyEvent;

    public onAdd?: (object: FabricObject) => void;
    public onContext?: (el: HTMLDivElement, e: React.MouseEvent, target?: FabricObject) => Promise<any>;
    public onZoom?: (zoomRatio: number) => void;
    public onClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    public onDblClick?: (canvas: FabricCanvas, target: FabricObject) => void;
    public onModified?: (target: FabricObject) => void;
    public onSelect?: (target: FabricObject) => void;
    public onRemove?: (target: FabricObject) => void;
    public onTransaction?: (transaction: TransactionEvent) => void;
    public onInteraction?: (interactionMode: InteractionMode) => void;

    public imageHandler: ImageHandler;
    public cropHandler: CropHandler;
    public contextmenuHandler: ContextmenuHandler;
    public zoomHandler: ZoomHandler;
    public workareaHandler: WorkareaHandler;
    public interactionHandler: InteractionHandler;
    public transactionHandler: TransactionHandler;
    public gridHandler: GridHandler;
    public alignmentHandler: AlignmentHandler;
    public guidelineHandler: GuidelineHandler;
    public eventHandler: EventHandler;
    public drawingHandler: DrawingHandler;
    public shortcutHandler: ShortcutHandler;

    public objectMap: Record<string, FabricObject> = {};
    public objects: FabricObject[];
    public activeLine?: any;
    public activeShape?: any;
    public zoom = 1;
    public prevTarget?: FabricObject;
    public target?: FabricObject;
    public pointArray?: any[];
    public lineArray?: any[];
    public isCut = false;
    
    private clipboard: any;

    constructor(options: HandlerOptions) {
        this.init(options);
        this.initCallback(options);
        this.initHandler(options);
    }

    /**
     * Init class fields
     * @param {HandlerOptions} options
     */
    public init = (options: HandlerOptions) => {
        this.id = options.id;
        this.canvas = options.canvas;
        this.container = options.container;
        this.editable = options.editable;
        this.interactionMode = options.interactionMode;
        this.propertiesToInclude = options.propertiesToInclude;
        this.minZoom = options.minZoom;
        this.maxZoom = options.maxZoom;
        this.workareaOption = options.workareaOption;
        this.canvasOption = options.canvasOption;
        this.gridOption = options.gridOption;
        this.defaultOption = options.defaultOption;
        this.fabricObjects = Object.assign({}, CanvasObject, options.fabricObjects);
        this.guidelineOption = options.guidelineOption;
        this.zoomEnabled = options.zoomEnabled;
        this.activeSelection = options.activeSelection;
        this.width = options.width;
        this.height = options.height;
        this.keyEvent = options.keyEvent;

        this.objects = [];
    }

    /**
     * Init callback
     * @param {HandlerOptions} options
     */
    public initCallback = (options: HandlerOptions) => {
        this.onAdd = options.onAdd;
        this.onZoom = options.onZoom;
        this.onContext = options.onContext;
        this.onClick = options.onClick;
        this.onModified = options.onModified;
        this.onDblClick = options.onDblClick;
        this.onSelect = options.onSelect;
        this.onRemove = options.onRemove;
        this.onTransaction = options.onTransaction;
        this.onInteraction = options.onInteraction;
    }

    /**
     * @description Init handlers
     * @param {HandlerOptions} options
     */
    public initHandler = (_options: HandlerOptions) => {
        this.imageHandler = new ImageHandler(this);
        this.cropHandler = new CropHandler(this);
        this.contextmenuHandler = new ContextmenuHandler(this);
        this.zoomHandler = new ZoomHandler(this);
        this.workareaHandler = new WorkareaHandler(this);
        this.interactionHandler = new InteractionHandler(this);
        this.transactionHandler = new TransactionHandler(this);
        this.gridHandler = new GridHandler(this);
        this.alignmentHandler = new AlignmentHandler(this);
        this.guidelineHandler = new GuidelineHandler(this);
        this.eventHandler = new EventHandler(this);
        this.drawingHandler = new DrawingHandler(this);
        this.shortcutHandler = new ShortcutHandler(this);
    }

    /**
     * Get primary object
     * @returns {FabricObject[]}
     */
    public getObjects = (): FabricObject[] => {
        const objects = this.canvas.getObjects().filter((obj: FabricObject) => {
            if (obj.id === 'workarea') {
                return false;
            } else if (obj.id === 'grid') {
                return false;
            } else if (!obj.id) {
                return false;
            }
            return true;
        }) as FabricObject[];
        if (objects.length) {
            objects.forEach(obj => this.objectMap[obj.id] = obj);
        } else {
            this.objectMap = {};
        }
        return objects;
    }

    /**
     * Set key pair
     * @param {keyof FabricObject} key
     * @param {*} value
     * @returns
     */
    public set = (key: keyof FabricObject, value: any) => {
        const activeObject = this.canvas.getActiveObject() as any;
        if (!activeObject) {
            return;
        }
        activeObject.set(key, value);
        activeObject.setCoords();
        this.canvas.requestRenderAll();
        const { onModified } = this;
        if (onModified) {
            onModified(activeObject);
        }
    }

    /**
     * Set option
     * @param {Partial<FabricObject>} option
     * @returns
     */
    public setObject = (option: Partial<FabricObject>) => {
        const activeObject = this.canvas.getActiveObject() as any;
        if (!activeObject) {
            return;
        }
        Object.keys(option).forEach(key => {
            if (option[key] !== activeObject[key]) {
                activeObject.set(key, option[key]);
                activeObject.setCoords();
            }
        });
        this.canvas.requestRenderAll();
        const { onModified } = this;
        if (onModified) {
            onModified(activeObject);
        }
    }

    /**
     * Set key pair by object
     * @param {FabricObject} obj
     * @param {string} key
     * @param {*} value
     * @returns
     */
    public setByObject = (obj: any, key: string, value: any) => {
        if (!obj) {
            return;
        }
        obj.set(key, value);
        obj.setCoords();
        this.canvas.renderAll();
        const { onModified } = this;
        if (onModified) {
            onModified(obj);
        }
    }

    /**
     * Set key pair by id
     * @param {string} id
     * @param {string} key
     * @param {*} value
     */
    public setById = (id: string, key: string, value: any) => {
        const findObject = this.findById(id);
        this.setByObject(findObject, key, value);
    }

    /**
     * Set partial by object
     * @param {FabricObject} obj
     * @param {FabricObjectOption} option
     * @returns
     */
    public setByPartial = (obj: FabricObject, option: FabricObjectOption) => {
        if (!obj) {
            return;
        }
        obj.set(option);
        obj.setCoords();
        this.canvas.renderAll();
    }

    /**
     * Set shadow
     * @param {fabric.Shadow} option
     * @returns
     */
    public setShadow = (option: fabric.IShadowOptions) => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }
        activeObject.setShadow(option as fabric.Shadow);
        this.canvas.requestRenderAll();
        const { onModified } = this;
        if (onModified) {
            onModified(activeObject);
        }
    }

    /**
     * Set the image
     * @param {FabricImage} obj
     * @param {*} source
     * @returns
     */
    public setImage = (obj: FabricImage, source: any) => {
        if (!source) {
            this.loadImage(obj, null);
            obj.set('file', null);
            obj.set('src', null);
            return;
        }
        if (source instanceof File) {
             const reader = new FileReader();
             reader.onload = () => {
                 this.loadImage(obj, reader.result as string);
                 obj.set('file', source);
                 obj.set('src', null);
             };
             reader.readAsDataURL(source);
        } else {
             this.loadImage(obj, source);
             obj.set('file', null);
             obj.set('src', source);
        }
    }

    /**
     * Set image by id
     * @param {string} id
     * @param {*} source
     */
    public setImageById = (id: string, source: any) => {
        const findObject = this.findById(id) as FabricImage;
        this.setImage(findObject, source);
    }

    /**
     * Set visible
     * @param {boolean} [visible]
     * @returns
     */
    public setVisible = (visible?: boolean) => {
        const activeObject = this.canvas.getActiveObject() as FabricElement;
        if (!activeObject) {
            return;
        }
        activeObject.set({
            visible,
        });
        this.canvas.renderAll();
    }

    /**
     * Set the position on Object
     *
     * @param {FabricObject} obj
     * @param {boolean} [centered]
     */
    public centerObject = (obj: FabricObject, centered?: boolean) => {
        if (centered) {
            this.canvas.centerObject(obj);
            obj.setCoords();
        } else {
            this.setByPartial(obj, {
                left: (obj.left / this.canvas.getZoom()) - (obj.width / 2) - (this.canvas.viewportTransform[4] / this.canvas.getZoom()),
                top: (obj.top / this.canvas.getZoom()) - (obj.height / 2) - (this.canvas.viewportTransform[5] / this.canvas.getZoom()),
            });
        }
    }

    /**
     * Add object
     * @param {FabricObjectOption} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    public add = (obj: FabricObjectOption, centered = true, loaded = false, transaction = true) => {
        const { editable, onAdd, gridOption, defaultOption } = this;
        const option: any = {
            hasControls: editable,
            hasBorders: editable,
            selectable: editable,
            lockMovementX: !editable,
            lockMovementY: !editable,
            hoverCursor: !editable ? 'pointer' : 'move',
        };
        if (obj.type === 'i-text') {
            option.editable = false;
        } else {
            option.editable = editable;
        }
        const newOption = Object.assign({}, defaultOption, obj, {
            container: this.container.id,
            editable,
        }, option);
        if (obj.type === 'svg') {
            return this.addSVG(newOption, centered, loaded);
        }
        let createdObj;
        // Create canvas object
        if (obj.type === 'image') {
            createdObj = this.addImage(newOption);
        } else if (obj.type === 'group') {
            const objects = this.addGroup(newOption, centered, loaded);
            const groupOption = Object.assign({}, newOption, { objects, name: 'New Group' });
            createdObj = this.fabricObjects[obj.type].create(groupOption);
        } else {
            createdObj = this.fabricObjects[obj.type].create(newOption);
        }
        this.canvas.add(createdObj);
        this.objects = this.getObjects();
        if (!editable) {
            createdObj.on('mousedown', this.eventHandler.object.mousedown);
        }
        if (createdObj.dblclick) {
            createdObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
        }
        if (
            obj.superType !== 'drawing'
            && editable
            && !loaded
        ) {
            this.centerObject(createdObj, centered);
        }
        if (gridOption.enabled) {
            this.gridHandler.setCoords(createdObj);
        }
        if (!this.transactionHandler.active && transaction) {
            this.transactionHandler.save('add');
        }
        if (onAdd && editable && !loaded) {
            onAdd(createdObj);
        }
        return createdObj;
    }

    /**
     * Add group object
     * @param {FabricGroup} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    public addGroup = (obj: FabricGroup, centered = true, loaded = false) => {
        return obj.objects.map(child => {
            return this.add(child, centered, loaded);
        });
    }

    /**
     * Add iamge object
     * @param {FabricImage} obj
     * @returns
     */
    public addImage = (obj: FabricImage) => {
        const { defaultOption } = this;
        const { filters = [], ...otherOption } = obj;
        const image = new Image();
        if (obj.src) {
            image.src = obj.src;
        }
        const createdObj = new fabric.Image(image, {
            ...defaultOption,
            ...otherOption,
        }) as FabricImage;
        createdObj.set({
            filters: this.imageHandler.createFilters(filters),
        });
        this.setImage(createdObj, obj.src || obj.file);
        return createdObj;
    }

    /**
     * Add svg object
     * @param {*} obj
     * @param {boolean} [centered=true]
     * @param {boolean} [loaded=false]
     * @returns
     */
    public addSVG = (obj: any, centered = true, loaded = false) => {
        const { defaultOption } = this;
        return new Promise((resolve: any) => {
            const getSVGElements = (object: any, objects: any, options: any) => {
                const createdObj = fabric.util.groupSVGElements(objects, options) as FabricObject;
                createdObj.set({ ...defaultOption, ...object });
                this.canvas.add(createdObj);
                this.objects = this.getObjects();
                const { onAdd, editable } = this;
                if (!editable) {
                    createdObj.on('mousedown', this.eventHandler.object.mousedown);
                }
                if (createdObj.dblclick) {
                    createdObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                if (editable && !loaded) {
                    this.centerObject(createdObj, centered);
                }
                if (onAdd && !loaded && editable) {
                    onAdd(createdObj);
                }
                return createdObj;
            };
            if (obj.loadType === 'svg') {
                fabric.loadSVGFromString(obj.svg, (objects, options) => {
                    resolve(getSVGElements(obj, objects, options));
                });
            } else {
                fabric.loadSVGFromURL(obj.svg, (objects, options) => {
                    resolve(getSVGElements(obj, objects, options));
                });
            }
        });
    }

    /**
     * Remove object
     * @param {FabricObject} target
     * @returns {any}
     */
    public remove = (target?: FabricObject) => {
        const activeObject = target || this.canvas.getActiveObject() as any;
        if (!activeObject) {
            return;
        }
        if (typeof activeObject.deletable !== 'undefined' && !activeObject.deletable) {
            return;
        }
        if (activeObject.type !== 'activeSelection') {
            this.canvas.discardActiveObject();
            this.canvas.remove(activeObject);
        } else {
            const { _objects: activeObjects } = activeObject;
            const existDeleted = activeObjects.some((obj: any) => typeof obj.deletable !== 'undefined' && !obj.deletable);
            if (existDeleted) {
                return;
            }
            this.canvas.discardActiveObject();
            activeObjects.forEach((obj: any) => {
                this.canvas.remove(obj);
            });
        }
        if (!this.transactionHandler.active) {
            this.transactionHandler.save('remove');
        }
        this.objects = this.getObjects();
        const { onRemove } = this;
        if (onRemove) {
            onRemove(activeObject);
        }
    }

    /**
     * Remove object by id
     * @param {string} id
     */
    public removeById = (id: string) => {
        const findObject = this.findById(id);
        if (findObject) {
            this.remove(findObject);
        }
    }

    /**
     * Delete at origin object list
     * @param {string} id
     */
    public removeOriginById = (id: string) => {
        const object = this.findOriginByIdWithIndex(id);
        if (object.index > 0) {
            this.objects.splice(object.index, 1);
        }
    }

    /**
     * Duplicate object
     * @returns
     */
    public duplicate = () => {
        const { onAdd, propertiesToInclude, gridOption: { grid = 10 } } = this;
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (!activeObject) {
            return;
        }
        if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
            return;
        }
        activeObject.clone((clonedObj: FabricObject) => {
            this.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + grid,
                top: clonedObj.top + grid,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                const activeSelection = clonedObj as fabric.ActiveSelection;
                activeSelection.canvas = this.canvas;
                activeSelection.forEachObject((obj: any) => {
                    obj.set('id', v4());
                    this.canvas.add(obj);
                    this.objects = this.getObjects();
                    if (obj.dblclick) {
                        obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                    }
                });
                if (onAdd) {
                    onAdd(activeSelection);
                }
                activeSelection.setCoords();
            } else {
                if (activeObject.id === clonedObj.id) {
                    clonedObj.set('id', v4());
                }
                this.canvas.add(clonedObj);
                this.objects = this.getObjects();
                if (clonedObj.dblclick) {
                    clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                if (onAdd) {
                    onAdd(clonedObj);
                }
            }
            this.canvas.setActiveObject(clonedObj);
            this.canvas.requestRenderAll();
        }, propertiesToInclude);
    }

    /**
     * Duplicate object by id
     * @param {string} id
     * @returns
     */
    public duplicateById = (id: string) => {
        const { onAdd, propertiesToInclude, gridOption: { grid = 10 } } = this;
        const findObject = this.findById(id);
        if (findObject) {
            if (typeof findObject.cloneable !== 'undefined' && !findObject.cloneable) {
                return false;
            }
            findObject.clone((cloned: FabricObject) => {
                cloned.set({
                    left: cloned.left + grid,
                    top: cloned.top + grid,
                    id: v4(),
                    evented: true,
                });
                this.canvas.add(cloned);
                this.objects = this.getObjects();
                if (onAdd) {
                    onAdd(cloned);
                }
                if (cloned.dblclick) {
                    cloned.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                this.canvas.setActiveObject(cloned);
                this.canvas.requestRenderAll();
            }, propertiesToInclude);
        }
        return true;
    }

    /**
     * Cut object
     *
     */
    public cut = () => {
        this.copy();
        this.remove();
        this.isCut = true;
    }

    /**
     * Copy to clipboard
     *
     * @param {*} value
     */
    public copyToClipboard = (value: any) => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.value = value;
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.canvas.wrapperEl.focus();
    }

    /**
     * Copy object
     *
     * @returns
     */
    public copy = () => {
        const { propertiesToInclude } = this;
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            if (typeof activeObject.cloneable !== 'undefined' && !activeObject.cloneable) {
                return false;
            }
            activeObject.clone((cloned: any) => {
                if (this.keyEvent.clipboard) {
                    this.copyToClipboard(JSON.stringify(cloned.toObject(propertiesToInclude), null, '\t'));
                    return;
                }
                this.clipboard = cloned;
            }, propertiesToInclude);
        }
        return true;
    }

    /**
     * Paste object
     *
     * @returns
     */
    public paste = () => {
        const { onAdd, propertiesToInclude, gridOption: { grid = 10 }, clipboard, isCut } = this;
        const padding = isCut ? 0 : grid;
        if (!clipboard) {
            return false;
        }
        if (typeof clipboard.cloneable !== 'undefined' && !clipboard.cloneable) {
            return false;
        }
        this.isCut = false;
        clipboard.clone((clonedObj: any) => {
            this.canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + padding,
                top: clonedObj.top + padding,
                id: isCut ? clonedObj.id : v4(),
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                clonedObj.canvas = this.canvas;
                clonedObj.forEachObject((obj: any) => {
                    obj.set('id', isCut ? obj.id : v4());
                    this.canvas.add(obj);
                    if (obj.dblclick) {
                        obj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                    }
                    this.objects = this.getObjects();
                });
                if (onAdd) {
                    onAdd(clonedObj);
                }
                clonedObj.setCoords();
            } else {
                this.canvas.add(clonedObj);
                if (clonedObj.dblclick) {
                    clonedObj.on('mousedblclick', this.eventHandler.object.mousedblclick);
                }
                this.objects = this.getObjects();
                if (onAdd) {
                    onAdd(clonedObj);
                }
            }
            const newClipboard = clipboard.set({
                top: clonedObj.top,
                left: clonedObj.left,
            });
            if (isCut) {
                this.clipboard = null;
            } else {
                this.clipboard = newClipboard;
            }
            this.canvas.setActiveObject(clonedObj);
            this.canvas.requestRenderAll();
            if (!this.transactionHandler.active) {
                this.transactionHandler.save('paste');
            }
        }, propertiesToInclude);
        return true;
    }

    /**
     * Load the image
     * @param {FabricImage} obj
     * @param {string} src
     */
    public loadImage = (obj: FabricImage, src: string) => {
        let url = src;
        if (!url) {
            url = './images/sample/transparentBg.png';
        }
        fabric.util.loadImage(url, source => {
            if (obj.type !== 'image') {
                obj.setPatternFill({
                    source,
                    repeat: 'repeat',
                }, null);
                obj.setCoords();
                this.canvas.renderAll();
                return;
            }
            obj.setElement(source);
            obj.setCoords();
            this.canvas.renderAll();
        });
    }

    /**
     * Find object by object
     * @param {FabricObject} obj
     */
    public find = (obj: FabricObject) => this.findById(obj.id)

    /**
     * Find object by id
     * @param {string} id
     * @returns {(FabricObject | null)}
     */
    public findById = (id: string): FabricObject | null => {
        let findObject;
        const exist = this.objects.some(obj => {
            if (obj.id === id) {
                findObject = obj;
                return true;
            }
            return false;
        });
        if (!exist) {
            warning(true, 'Not found object by id.');
            return null;
        }
        return findObject;
    }

    /**
     * Find object in origin list
     * @param {string} id
     * @returns
     */
    public findOriginById = (id: string) => {
        let findObject: FabricObject;
        const exist = this.objects.some(obj => {
            if (obj.id === id) {
                findObject = obj;
                return true;
            }
            return false;
        });
        if (!exist) {
            console.warn('Not found object by id.');
            return null;
        }
        return findObject;
    }

    /**
     * Return origin object list
     * @param {string} id
     * @returns
     */
    public findOriginByIdWithIndex = (id: string) => {
        let findObject;
        let index = -1;
        const exist = this.objects.some((obj, i) => {
            if (obj.id === id) {
                findObject = obj;
                index = i;
                return true;
            }
            return false;
        });
        if (!exist) {
            console.warn('Not found object by id.');
            return {};
        }
        return {
            object: findObject,
            index,
        };
    }

    /**
     * Select object
     * @param {FabricObject} obj
     * @param {boolean} [find]
     */
    public select = (obj: FabricObject, find?: boolean) => {
        let findObject = obj;
        if (find) {
            findObject = this.find(obj);
        }
        if (findObject) {
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(findObject);
            this.canvas.requestRenderAll();
        }
    }

    /**
     * Select by id
     * @param {string} id
     */
    public selectById = (id: string) => {
        const findObject = this.findById(id);
        if (findObject) {
            this.canvas.discardActiveObject();
            this.canvas.setActiveObject(findObject);
            this.canvas.requestRenderAll();
        }
    }

    /**
     * Select all
     * @returns
     */
    public selectAll = () => {
        this.canvas.discardActiveObject();
        const filteredObjects = this.canvas.getObjects().filter((obj: any) => {
            if (obj.id === 'workarea') {
                return false;
            } else if (!obj.evented) {
                return false;
            } else if (obj.locked) {
                return false;
            }
            return true;
        });
        if (!filteredObjects.length) {
            return;
        }
        if (filteredObjects.length === 1) {
            this.canvas.setActiveObject(filteredObjects[0]);
            this.canvas.renderAll();
            return;
        }
        const activeSelection = new fabric.ActiveSelection(filteredObjects, {
            canvas: this.canvas,
            ...this.activeSelection,
        });
        this.canvas.setActiveObject(activeSelection);
        this.canvas.renderAll();
    }

    /**
     * Save origin width, height
     * @param {FabricObject} obj
     * @param {number} width
     * @param {number} height
     */
    public originScaleToResize = (obj: FabricObject, width: number, height: number) => {
        if (obj.id === 'workarea') {
            this.setByPartial(obj, {
                workareaWidth: obj.width,
                workareaHeight: obj.height,
            });
        }
        this.setByPartial(obj, {
            scaleX: width / obj.width,
            scaleY: height / obj.height,
        });
    }

    /**
     * Import json
     * @param {*} json
     * @param {(canvas: FabricCanvas) => void} [callback]
     */
    public importJSON = (json: any, callback?: (canvas: FabricCanvas) => void) => {
        let prevLeft = 0;
        let prevTop = 0;
        this.canvas.setZoom(1);
        this.canvas.setBackgroundColor(this.canvasOption.backgroundColor, this.canvas.renderAll.bind(this.canvas));
        const workareaExist = json.filter((obj: FabricObjectOption) => obj.id === 'workarea');
        if (!this.workarea) {
            this.workareaHandler.init();
        }
        if (!workareaExist.length) {
            this.canvas.centerObject(this.workarea);
            this.workarea.setCoords();
            prevLeft = this.workarea.left;
            prevTop = this.workarea.top;
        } else {
            const workarea = workareaExist[0];
            prevLeft = workarea.left;
            prevTop = workarea.top;
            this.workarea.set(workarea);
            this.canvas.centerObject(this.workarea);
            this.workareaHandler.setImage(workarea.src, true);
            this.workarea.setCoords();
        }
        
        setTimeout(() => {
            json.forEach((obj: FabricObjectOption) => {
                if (obj.id === 'workarea') {
                    return;
                }
                const { left, top } = this.workarea;
                const diffLeft = left - prevLeft;
                const diffTop = top - prevTop;
                obj.left += diffLeft;
                obj.top += diffTop;
                if (obj.clipPath) {
                    const self = this;
                    obj.clipPath.top += top - prevTop;
                    obj.clipPath.left += left - prevLeft;
                    fabric.util.enlivenObjects([obj.clipPath], function(enlivedProps: Array<fabric.Object>) {
                        obj.clipPath = enlivedProps[0];
                        self.add(obj, false, true, false);
                        self.canvas.renderAll();
                    }, null);
                } else {
                    this.add(obj, false, true, false);
                    this.canvas.renderAll();
                }
            });
            if (callback) {
                callback(this.canvas);
            }
        }, 300);
    }

    /**
     * Export json
     */
    public exportJSON = () => this.canvas.toJSON(this.propertiesToInclude)

    /**
     * Active selection to group
     * @returns
     */
    public toGroup = (target?: FabricObject) => {
        const activeObject = target || this.canvas.getActiveObject() as fabric.ActiveSelection;
        if (!activeObject) {
            return;
        }
        if (activeObject.type !== 'activeSelection') {
            return;
        }
        const group = activeObject.toGroup() as any;
        group.set({
            id: v4(),
            name: 'New group',
            type: 'group',
            ...this.defaultOption,
        });
        this.objects = this.getObjects();
        if (!this.transactionHandler.active) {
            this.transactionHandler.save('group');
        }
        if (this.onSelect) {
            this.onSelect(group);
        }
        this.canvas.renderAll();
        return group;
    }

    /**
     * Group to active selection
     * @returns
     */
    public toActiveSelection = (target?: FabricObject) => {
        const activeObject = target || this.canvas.getActiveObject() as fabric.Group;
        if (!activeObject) {
            return;
        }
        if (activeObject.type !== 'group') {
            return;
        }
        const activeSelection = activeObject.toActiveSelection();
        this.objects = this.getObjects();
        if (!this.transactionHandler.active) {
            this.transactionHandler.save('ungroup');
        }
        if (this.onSelect) {
            this.onSelect(activeSelection);
        }
        this.canvas.renderAll();
        return activeSelection;
    }

    /**
     * Bring forward
     */
    public bringForward = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            this.canvas.bringForward(activeObject);
            if (!this.transactionHandler.active) {
                this.transactionHandler.save('bringForward');
            }
            const { onModified } = this;
            if (onModified) {
                onModified(activeObject);
            }
        }
    }

    /**
     * Bring to front
     */
    public bringToFront = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            this.canvas.bringToFront(activeObject);
            if (!this.transactionHandler.active) {
                this.transactionHandler.save('bringToFront');
            }
            const { onModified } = this;
            if (onModified) {
                onModified(activeObject);
            }
        }
    }

    /**
     * Send backwards
     * @returns
     */
    public sendBackwards = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            const firstObject = this.canvas.getObjects()[1] as FabricObject;
            if (firstObject.id === activeObject.id) {
                return;
            }
            if (!this.transactionHandler.active) {
                this.transactionHandler.save('sendBackwards');
            }
            this.canvas.sendBackwards(activeObject);
            const { onModified } = this;
            if (onModified) {
                onModified(activeObject);
            }
        }
    }

    /**
     * Send to back
     */
    public sendToBack = () => {
        const activeObject = this.canvas.getActiveObject() as FabricObject;
        if (activeObject) {
            this.canvas.sendToBack(activeObject);
            this.canvas.sendToBack(this.canvas.getObjects()[1]);
            if (!this.transactionHandler.active) {
                this.transactionHandler.save('sendToBack');
            }
            const { onModified } = this;
            if (onModified) {
                onModified(activeObject);
            }
        }
    }

    /**
     * Clear canvas
     * @param {boolean} [includeWorkarea=false]
     */
    public clear = (includeWorkarea = false) => {
        if (includeWorkarea) {
            this.canvas.clear();
            this.workarea = null;
        } else {
            this.canvas.getObjects().forEach((obj: any) => {
                if (obj.id === 'grid' || obj.id === 'workarea') {
                    return;
                }
                this.canvas.remove(obj);
            });
        }
        this.objects = this.getObjects();
        this.canvas.renderAll();
    }

    /**
     * Save target object as image
     * @param {FabricObject} targetObject
     * @param {string} [option={ name: 'New Image', format: 'png', quality: 1 }]
     */
    public saveImage = (targetObject: FabricObject, option = { name: 'New Image', format: 'png', quality: 1 }) => {
        let dataUrl;
        let target = targetObject;
        if (target) {
            dataUrl = target.toDataURL(option);
        } else {
            target = this.canvas.getActiveObject() as FabricObject;
            if (target) {
                dataUrl = target.toDataURL(option);
            }
        }
        if (dataUrl) {
            const anchorEl = document.createElement('a');
            anchorEl.href = dataUrl;
            anchorEl.download = `${option.name}.png`;
            document.body.appendChild(anchorEl); // required for firefox
            anchorEl.click();
            anchorEl.remove();
        }
    }

    /**
     * Save canvas as image
     * @param {string} [option={ name: 'New Image', format: 'png', quality: 1, multiplier: 1 }]
     */
    public saveCanvasImage = (option = { name: 'Image', format: 'png', quality: 1, multiplier: 300 / 72 }) => {
        const viewport = {
            width: this.workarea.width * this.workarea.scaleX,
            height: this.workarea.height * this.workarea.scaleY,
            top: this.workarea.top,
            left: this.workarea.left,
        }
        this.canvas.getObjects().forEach((el: FabricObject) => {
            if(el.id == 'workarea') {
                el.visible = false;
            }
        });
        this.canvas.renderAll();

        const dataUrl = this.canvas.toDataURL({...viewport, ...option});
        if (dataUrl) {
            const anchorEl = document.createElement('a');
            anchorEl.href = changedpi.changeDpiDataUrl(dataUrl, 300);
            anchorEl.download = `${option.name}.png`;
            document.body.appendChild(anchorEl); // required for firefox
            anchorEl.click();
            anchorEl.remove();
        }
        this.canvas.getObjects().forEach((el: FabricObject) => {
            if(el.id == 'workarea') {
                el.visible = true;
            }
        });
        this.canvas.renderAll();
    }
}

export default Handler;
