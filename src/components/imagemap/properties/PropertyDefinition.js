import MarkerProperty from './MarkerProperty';
import GeneralProperty from './GeneralProperty';
import StyleProperty from './StyleProperty';
import ImageProperty from './ImageProperty';
import TextProperty from './TextProperty';
import MapProperty from './MapProperty';
import ShadowProperty from './ShadowProperty';
import ImageFilterProperty from './ImageFilterProperty';

export default {
    map: {
        map: {
            title: 'Map',
            component: MapProperty,
        },
        image: {
            title: 'Image',
            component: ImageProperty,
        },
    },
    group: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    'i-text': {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        marker: {
            title: 'Marker',
            component: MarkerProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    textbox: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        text: {
            title: 'Text',
            component: TextProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    image: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        image: {
            title: 'Image',
            component: ImageProperty,
        },
        filter: {
            title: 'Filter',
            component: ImageFilterProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    triangle: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    rect: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    circle: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    polygon: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    line: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    arrow: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
    element: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
    },
    svg: {
        general: {
            title: 'General',
            component: GeneralProperty,
        },
        style: {
            title: 'Style',
            component: StyleProperty,
        },
        shadow: {
            title: 'Shadow',
            component: ShadowProperty,
        },
    },
};
