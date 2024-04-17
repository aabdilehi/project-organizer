import { useLayoutEffect, useRef } from "react";

export default ({resizeRef, canResize = true, onResize, ...props} : {resizeRef: React.MutableRefObject<any>,canResize?: boolean, onResize: (props: any[]) => void}) => {

    const resizeType = useRef();
    const resizeOrigin = useRef();
    const initialWidth = useRef(0);
    const initialHeight = useRef(0);
    const initialCoords = useRef({x: 0, y: 0});
    const initialBounds = useRef(0);
    if(!!resizeRef && !!resizeRef.current) {

        const handleDrag = (e) => {
            // Get initial width/height
            e.stopPropagation();
        if(!resizeType.current || !resizeOrigin.current || resizeRef.current) return;
        console.log("Mouse move");
        
            let newWidth = resizeType.current == "horizontal" || resizeType.current == "both" ? initialWidth.current + (e.clientX - initialCoords.current.x) : initialWidth.current;
            let newHeight = resizeType.current == "vertical" || resizeType.current == "both" ? initialHeight.current + (e.clientY - initialCoords.current.y) : initialHeight.current;
        
            resizeRef.current.style.width = newWidth + "px";
            resizeRef.current.style.height = newHeight + "px";

            const animate = () => {
                    if(resizeOrigin.current == "top" || resizeOrigin.current == "top-left" || resizeOrigin.current == "top-right" || resizeOrigin.current == "left" || resizeOrigin.current == "top-left" || resizeOrigin.current == "bottom-left") {
                        resizeRef.current.style.transform = `translate(${initialBounds.current.left + (newWidth - initialWidth.current)}px, ${initialBounds.current.top + (newHeight - initialHeight.current)}px)`;
                    }
                    if(newWidth !== initialWidth.current || newHeight !== initialHeight.current) {
                        requestAnimationFrame(animate)
                    }
                
            }
        requestAnimationFrame(animate);
        }

    const handleDragStart = (e) => {
        e.stopPropagation();
        
        resizeType.current = e.target.getAttribute("data-resize-type") ?? undefined;
        resizeOrigin.current = e.target.getAttribute("data-resize-origin") ?? undefined;
        if(!resizeType.current || !resizeOrigin.current || resizeRef.current) return;

        initialBounds.current = resizeRef?.current?.getBoundingClientRect();
        initialWidth.current = initialBounds?.current.width;
        initialHeight.current = initialBounds?.current.height;
        initialCoords.current = {x: e.clientX, y: e.clientY};
    };
        return (
            <div draggable={false} className="resize-wrapper">
                {/* Left */}
                {/* <div draggable={false} onDragStart={handleDragStart} onDrag={handleDrag} data-resize-type={"horizontal"} data-resize-origin={"left"} className="resize-handle left" tabIndex={99} /> */}
                {props.children ?? null}
            </div>
        );
    }

    return (
        <div className="resize-wrapper">
            {props.children ?? null}
        </div>
    );
   
}