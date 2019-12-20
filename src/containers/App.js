import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

import ImageMapEditor from '../components/imagemap/ImageMapEditor';

class App extends Component {
    state = {
    }

    render() {
        return (
            <div className="rde-main">
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="description" content="React Design Editor has started to developed direct manipulation of editable design tools like Powerpoint, We've developed it with react.js, ant.design, fabric.js " />
                    <link rel="manifest" href="./manifest.json" />
                    <link rel="shortcut icon" href="./favicon.ico" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/earlyaccess/notosanskr.css" />
                </Helmet>

                <div className="rde-content">
                    <ImageMapEditor />
                </div>
            </div>
        );
    }
}

export default App;
