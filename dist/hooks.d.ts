/// <reference types="react" />
import { MinMaxPair, Selection } from './types';
export declare function useResponsiveSVGSelection<T>(minSize: MinMaxPair, initialSize?: MinMaxPair): [React.MutableRefObject<HTMLDivElement>, Selection, MinMaxPair];
