import { MinMaxPair, Scale, Word } from './types';
export declare function choose<T = number | string>(array: T[], random: () => number): T;
export declare function getDefaultColors(): string[];
export declare function getFontScale(words: Word[], fontSizes: MinMaxPair, scale: Scale): (n: number) => number;
export declare function getText(word: Word): string;
export declare function getFontSize(word: Word): string;
export declare function getTransform(word: Word): string;
export declare function rotate(rotations: number, rotationAngles: MinMaxPair, random: () => number): number;
