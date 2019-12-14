// Shim Buffer for use in a browser

import safeBuffer from 'safe-buffer';
const { Buffer } = safeBuffer;

export function encodeBase64( str ) {
    return Buffer.from( str ).toString( 'base64' );
}

export function base64ToBuffer( base64 ) {
    return Buffer.from(base64, 'base64');
}

export function isBuffer( obj ) {
    return obj instanceof Buffer;
}

export function toUtf8Buffer( str ) {
    if (str instanceof Buffer) {
        return str;
    } else {
        return Buffer.from( String(str), "utf8" );
    }
}

export function utf8ByteLength( str ) {
    return Buffer.byteLength( str , "utf8");
}
