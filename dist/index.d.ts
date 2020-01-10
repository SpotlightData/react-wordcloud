/// <reference types="react" />
import * as types from './types';
export * from './types';
export declare const defaultCallbacks: types.Callbacks;
export declare const defaultOptions: types.Options;
export interface Props {
    /**
     * Callbacks to control various word properties and behaviors.
     */
    callbacks?: types.CallbacksProp;
    /**
     * Maximum number of words to display.
     */
    maxWords?: number;
    /**
     * Set minimum [width, height] values for the SVG container.
     */
    minSize?: types.MinMaxPair;
    /**
     * Configure wordcloud with various options.
     */
    options?: types.OptionsProp;
    /**
     * Set explicit [width, height] values for the SVG container.  This will disable responsive resizing.
     */
    size?: types.MinMaxPair;
    /**
     * An array of word.  A word is an object that must contain the 'text' and 'value' keys.
     */
    words: types.Word[];
    /**
     * How long should we wait before a re-render
     */
    wait?: number;
}
declare function Wordcloud({ callbacks, maxWords, minSize, options, size: initialSize, words, wait, }: Props): JSX.Element;
declare namespace Wordcloud {
    var defaultProps: {
        callbacks: types.Callbacks;
        maxWords: number;
        minSize: number[];
        options: types.Options;
    };
}
export default Wordcloud;
