import { fabric } from 'fabric';

import {
    Line,
} from './objects';
import { FabricObject } from './utils';

export interface ObjectSchema {
    create: (...option: any) => fabric.Object;
}

export interface CanvasObjectSchema {
    [key: string]: ObjectSchema;
}

export const createCanvasObject = (objectSchema: CanvasObjectSchema) => objectSchema;

const CanvasObject: CanvasObjectSchema = {
    group: {
        create: ({ objects, ...option }: { objects: FabricObject[] }) => new fabric.Group(objects, option),
    },
    'i-text': {
        create: ({ text, ...option }: { text: string }) => new fabric.IText(text, option),
    },
    textbox: {
        create: ({ text, ...option }: { text: string }) => new fabric.Textbox(text, option),
    },
    triangle: {
        create: (option: any) => new fabric.Triangle(option),
    },
    circle: {
        create: (option: any) => new fabric.Circle(option),
    },
    ellipse: {
        create: (option: any) => new fabric.Ellipse(option),
    },
    rect: {
        create: (option: any) => new fabric.Rect(option),
    },
    path: {
        create: ({ path, ...option }: { path: any }) => new fabric.Path(path, option),
    },
    image: {
        create: ({ element = new Image(), ...option }) => new fabric.Image(element, {
            ...option,
            crossOrigin: 'anonymous',
        }),
    },
    polygon: {
        create: ({ points, ...option }: { points: any }) => new fabric.Polygon(points, {
            ...option,
            perPixelTargetFind: true,
        }),
    },
    line: {
        create: ({ points, ...option }: { points: any }) => new Line(points, option),
    }
};

export default CanvasObject;
