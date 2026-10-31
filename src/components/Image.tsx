import type {ImgHTMLAttributes} from 'react';
import {useState} from 'react';

export function Image({src, alt, ...props}: ImgHTMLAttributes<HTMLImageElement>) {
    const [failedSrc, setFailedSrc] = useState<string>();
    return <img {...props} src={!src || failedSrc === src ? '/images/fallback.svg' : src}
                alt={alt || 'Little Stars clothing'} onError={() => setFailedSrc(src)}/>
}
