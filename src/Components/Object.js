import React, { useState, useEffect, useRef, useCallback } from 'react'
import store from '../store'
import { useSelector } from "react-redux"
import { useSpring, animated, to } from 'react-spring'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
// import { useGesture } from 'react-use-gesture'
import { isMobile } from 'react-device-detect'
import translate from '../utils/translate'

import Icon from '@mdi/react'
import { 
    mdiFlipHorizontal,
    mdiDelete,
    mdiExclamationThick,
    mdiRotateLeft,
    mdiArrowTopRightBottomLeftBold
} from '@mdi/js';

import TitleEditor from './TitleEditor'
import placeHolderImage from '../placeHolderImage.png'

import { adminUpdateTitle } from '../api/admin'

const ObjectItem = (props) => {

    const { isView } = props
    if (isView) {
        return <ViewModeItem {...props}/>
    }
    else {
        return <EditModeItem {...props} />
    }
}

const ViewModeItem = (props) => {

    const { data, editorScale, type } = props
    const { x, y, height, width, scale, flip, rot } = data

    const heads = useSelector(state => state.heads.data)

    const url = type == "head" ? 
        data.headId ? heads[data.headId]?.url : null
    :
        data.url

    return (
        <div 
            className='object'
            style={{
                width: width * editorScale,
                height: height * editorScale,
                transform: `translate(${(x - width * 0.5) * editorScale}px, ${(y - height * 0.5) * editorScale}px) rotate(${rot}deg) scale(${scale})`,
                zIndex: 999,
            }}     
        >
            <img 
                className='object-image'
                src={
                    type == 'head' ? 
                        url ?? placeHolderImage
                    :
                        url
                } 
                style={{ transform: `scaleX(${flip? -1 : 1 })` }}
            />
        </div>
    )
}

const EditModeItem = ({ type, id, data, imageId, imageSize, isSelected, setSelectedItem, transformStart, editorScale, zoomScale, setMessage }) => {

    useEffect(() => {
        api.start({
            x: data.x,
            y: data.y,
            rot: data.rot,
            scale: data.scale,
            flip: data.flip ?? 0,
            width: data.width,
            height: data.height,
        })

        // init title image
        if (type == 'title' && !data.url)
            adminUpdateTitle(id, imageId)

    }, [data])
    
    const mode = useSelector(state => state.status.mode)
    const heads = useSelector(state => state.heads.data)

    const canEdit = !(type == 'title' && mode != 'admin')
    const [isTransforming, setIsTransforming] = useState(false)
    const [isTitleEditorVisible, setIsTitleEditorVisible] = useState(false)

    const ref = useRef()
    const gestureTarget = useRef()

    const url = type == "head" ? 
        data.headId ? heads[data.headId]?.url : null
    :
        data.url

    const deleteObject = () => {
        if (mode == "admin")
            store.dispatch({ type: type == 'head' ? 'DELETE_IMAGE_HEAD' : 'DELETE_IMAGE_TITLE', id, imageId })
        else if (type == "head") {
            store.dispatch({ type: 'RESET_IMAGE_HEAD', id, imageId })
        }
    }

    // gesture
    const useGesture = createUseGesture([dragAction, pinchAction])
    const [{ x, y, rot, scale, flip, width, height }, api] = useSpring(() => ({
        x: data.x,
        y: data.y,
        rot: data.rot,
        scale: data.scale,
        flip: data.flip ?? 0,
        width: data.width,
        height: data.height,
        config: { mass: 0, tension: 0, friction: 0 }
    }))

    const preventDefault = useCallback((e) => { e.preventDefault(); }, [])

    useGesture(
        {
            onDrag: ({ pinching, cancel, movement, first, memo }) => {
                if (pinching) return cancel()
                if (first) {
                    memo = {
                        x: x.get(),
                        y: y.get()
                    }
                }
                else {
                    let x = memo.x + movement[0] / editorScale / zoomScale
                    let y = memo.y + movement[1] / editorScale / zoomScale
                    x = Math.max(0, Math.min(x, imageSize.width))
                    y = Math.max(0, Math.min(y, imageSize.height))
                    api.start({ x, y })
                }
                return memo
            },
            onDragEnd: () => {
                updateTransform()
            },
            onPinch: ({ offset: [s, a], first, memo }) => {
                if (first) {
                  memo = {
                    scale: scale.get(),
                    rot: rot.get(),
                    s,
                    a,
                  }
                }
                api.start({ scale: memo.scale * s / memo.s, rot: memo.rot + a - memo.a })
                return memo
            },
            onPinchStart: () => {
                window.addEventListener('touchmove', preventDefault, { passive: false })
            },
            onPinchEnd: () => {
                updateTransform()
                window.removeEventListener('touchmove', preventDefault)
            },
        },
        { enabled: canEdit && isSelected, target : gestureTarget, eventOptions: { passive: false } }
    )

    const updateTransform = () => {
        const transform = {
            x: x.get(),
            y: y.get(),
            rot: rot.get(),
            scale: scale.get(),
            flip: flip.get(),
            width: width.get(),
            height: height.get(),
        }
        setIsTransforming(false)
        if (type == 'head')
            store.dispatch({ 
                type: 'UPDATE_IMAGE_HEAD', 
                data: { ...transform }, 
                id,
                imageId
            })
        else if (type == 'title') {

            // if width / height changed update title image
            const image = store.getState().images.data[imageId] 
            if (transform.width != image.titles[id].width || transform.height != image.titles[id].height) {
                const image_ = JSON.parse(JSON.stringify(image))
                image_.titles[id] = {
                    ...image_.titles[id],
                    ...transform
                }
                adminUpdateTitle(id, imageId, image_)
            }

            store.dispatch({ 
                type: 'UPDATE_IMAGE_TITLE', 
                data: { ...transform }, 
                id,
                imageId,
            })
        }
    }

    const rotateStart = (e) => {   
        if (e.targetTouches) e = e.targetTouches[0] 
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width * 0.5
        const centerY = rect.top + rect.height * 0.5
        const x = e.clientX - centerX
        const y = e.clientY - centerY
        const temp = {
            centerX,
            centerY,
            dist: Math.hypot(x,y),
            angle: Math.atan2(y,  x) / Math.PI * 180,
            scale: scale.get(),
            rot: rot.get(),
            width: width.get(),
            height: height.get()
        }
        setIsTransforming(true)
        transformStart((e) => rotateMove(e, temp), updateTransform)
    }

    const rotateMove = (e, temp) => {
        const minScale = 20

        const x = e.clientX - temp.centerX
        const y = e.clientY - temp.centerY

        let scale = temp.scale * Math.hypot(x, y) / temp.dist 
        if (temp.width * scale * editorScale < minScale || temp.height * scale * editorScale < minScale) 
            scale = Math.max(minScale / temp.width / editorScale, minScale / temp.height / editorScale)

        const rot = (temp.rot + ( Math.atan2(y, x) / Math.PI * 180 - temp.angle) ) % 360
        
        api.start({ 
            scale,
            rot, 
        })

        if (mode !='admin' && type == "head" && url)
            setIsHeadTooBig(scale > 1)
    }

    const scaleStart = (e) => {
        if (e.targetTouches) e = e.targetTouches[0] 
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width * 0.5
        const centerY = rect.top + rect.height * 0.5
        const x = e.clientX - centerX
        const y = e.clientY - centerY
        const angle = Math.PI * 0.5 - Math.atan2(x,y) - rot.get() * Math.PI / 180
        const distX = Math.hypot(x, y) * Math.cos(angle)
        const distY = Math.hypot(x, y) * Math.sin(angle)
        const temp = {
          width: width.get(),
          height: height.get(),
          centerX,
          centerY,
          distX,
          distY,
        }
        setIsTransforming(true)
        transformStart((e) => scaleMove(e, temp), updateTransform)
    }
    
    const scaleMove = (e, temp) => {
        let x = e.clientX - temp.centerX
        let y = e.clientY - temp.centerY

        const angle = Math.PI * 0.5 - Math.atan2(x,y) - rot.get() * Math.PI / 180;
        const distX = Math.hypot(x, y) * Math.cos(angle)
        const distY = Math.hypot(x, y) * Math.sin(angle)

        const minScale = 20
        const width = Math.max(minScale / scale.get() / editorScale, temp.width * distX / temp.distX)
        const height = Math.max(minScale / scale.get() / editorScale, temp.height * distY/ temp.distY)

        api.start({ 
            width,
            height, 
        })
    }

    const doFlip = () => {
        api.start({ 
            flip: 1 - flip.get(), 
        })
        setTimeout(() => updateTransform(), 100)
    }

    const centerButton = (
        <>
            {( 
                (isSelected && ( type == 'title' || (mode !='admin' && type == 'head' && Object.keys(heads).length > 0) ) ) 
            || 
                isTitleEditorVisible
            ) && 
                <animated.div 
                    className="center-button-wrapper" 
                    style={{ transform: to([scale, rot], (scale, rot) => `translate(-50%, -50%) rotate(${-rot}deg) scale(${1 / scale / zoomScale})`) }} 
                >
                    <div 
                        className="center-button"
                        onClick={() => {
                            if (type == 'head') {
                                if (isMobile) {
                                    store.dispatch({ 
                                        type: 'SELECT_HEAD_START', 
                                        selecting: { id, imageId }
                                    })
                                    store.dispatch({ 
                                        type: 'SET_POPUP', 
                                        mode: 'empty',
                                        payload: {
                                            isSelectingHead: true
                                        }
                                    })
                                }
                                else    
                                    store.dispatch({ 
                                        type: 'SET_POPUP', 
                                        mode: 'chooseHead',
                                        payload: {
                                            id,
                                            imageId,
                                            headId: data.headId
                                        }
                                    })
                            }
                            else if (type == "title") {
                                if (isMobile)
                                    store.dispatch({ type: 'SET_POPUP', mode: 'titleEditor', payload: { id, imageId, data } })
                                else
                                    setIsTitleEditorVisible(true)
                            }
                        }}
                    > 
                        {translate(type == 'head' ? 'select' : 'edit')}
                    </div>
                </animated.div>
            }
        </>
    )

    // head too big
    const [isHeadTooBig, setIsHeadTooBig] = useState(mode !='admin' && type == "head" && url && data.scale > 1)
    useEffect(() => {
        if (isMobile) {
            if (isHeadTooBig) {
                setMessage(translate('blurryWarning'))
                setTimeout( 
                    () => setMessage('')
                , 5000)
            }
            else 
                setMessage('')
        }
    }, [isHeadTooBig])

    return (
        <>
            <animated.div 
                className='object'
                ref={ref}
                style={{
                    width: to([width], (width) => width * editorScale),
                    height: to([height], (height) => height * editorScale),
                    transform: to([x, y, rot, scale, width, height], (x, y, rot, scale, width, height) => `translate(${(x - width * 0.5) * editorScale}px, ${(y - height * 0.5) * editorScale}px) rotate(${rot}deg) scale(${scale})`),
                    zIndex: (isSelected || isTransforming) ? 999999 : 999,
                }}
                onClick={() => {
                    if (isMobile)
                        setSelectedItem({ id, type })
                }}
                onMouseEnter={() => {
                    if (!isMobile)
                        setSelectedItem({ id, type })
                }}
            >
                <animated.img 
                    className='object-image'
                    src={
                        type == 'head' ? 
                            (mode == 'admin' || !url) ? placeHolderImage : url
                        :
                            url
                    } 
                    style={{ transform: to([flip], (flip) => `scaleX(${flip == 0 ? 1 : -1 })`), }}
                />
                
                {type == 'head' && mode == 'admin' &&
                    <animated.div 
                        className="head-text" 
                        style={{ fontSize: to([width], (width) => width * editorScale * 0.1) }}
                    >
                        移動此圖示
                    </animated.div>
                }

                {type == 'head' && mode != 'admin' && !data.headId &&
                    <animated.div 
                        className="head-text" 
                        style={{ fontSize: to([width], (width) => width * editorScale * 0.1) }}
                    >
                        {translate('chooseFace')}
                    </animated.div>
                }

                {/* drag area */}
                <div 
                    ref={gestureTarget}
                    className='object-drag-area' 
                    draggable="false" 
                    style={{ touchAction: "none" }}
                >
                    {isMobile && centerButton}
                </div>

                {!isMobile && centerButton}

                {/* tool */}
                {(isSelected || isTransforming) &&
                    <animated.div className='tool'>

                        <svg height="100%" width="100%">
                            <animated.rect width="100%" height="100%" fill="none" stroke="black" strokeWidth={to([scale], (scale) => 5 / scale / zoomScale)} />
                        </svg>

                        {/* rotate and scale */}
                        {(mode == 'admin' || type == "head") && 
                            <animated.div 
                                className="tool-button top-right" 
                                draggable="false" 
                                style={{ transform: to([scale], (scale) => `scale(${1 /  scale / zoomScale})`) }}
                                onMouseDown={!isMobile ? rotateStart : null}
                                onTouchStart={isMobile ? rotateStart : null}
                            >
                                <Icon path={mdiRotateLeft} size={0.9} color="white"/>
                            </animated.div>
                        }

                        {/* delete */}
                        {(mode == 'admin' || (type == "head" && url)) && 
                            <animated.div  
                                className={`tool-button${mode =='admin' ? ' bottom-left' : ' bottom-right'}`}
                                draggable="false" 
                                style={{ transform: to([scale], (scale) => `scale(${1 / scale / zoomScale})`), }}
                                onClick={deleteObject}
                            >
                                <Icon path={mdiDelete} size={0.9} color="white"/>
                            </animated.div>
                        }

                        {/* flip */}
                        {(mode == 'user' || mode == 'demo') && type == "head" && url &&
                            <animated.div
                                className="tool-button bottom-left" 
                                draggable="false" 
                                style={{ transform: to([scale], (scale) => `scale(${1 / scale / zoomScale})`), }}
                                onClick={doFlip}
                            >
                                <Icon path={mdiFlipHorizontal} size={0.9} color="white"/>
                            </animated.div>
                        }
               
                        {/* text scale */}
                        {mode =='admin' && type == 'title' &&
                            <animated.div  
                                className="tool-button bottom-right" 
                                draggable="false" 
                                style={{ transform: to([scale], (scale) => `scale(${1 / scale})`), }}
                                onMouseDown={!isMobile ? scaleStart : null}
                                onTouchStart={isMobile ? scaleStart : null}
                            >
                                <Icon path={mdiArrowTopRightBottomLeftBold} size={0.9} color="white"/>
                            </animated.div>
                        }

                        {/* head too big warning */}
                        {mode !='admin' && url && isHeadTooBig && !isMobile &&
                            <animated.div className="head-image-warning" style={{ transform: to([scale], (scale) => `scale(${1 / scale})`) }}>
                                <div>
                                    <Icon path={mdiExclamationThick} size={1.2} color="white"/>
                                    <animated.div className='head-image-warning-text' style={{ transform: to([rot], (rot) => `rotate(${-rot}deg)`) }}  >
                                        {translate('blurryWarning')}
                                    </animated.div>
                                </div>
                            </animated.div>
                        }

                    </animated.div>   
                }

                {type == "title" && isTitleEditorVisible &&
                    <animated.div 
                        className="title-editor-wrapper" 
                        style={{ transform: to([scale, rot], (scale, rot) => `translate(-50%, -50%) rotate(${-rot}deg) scale(${1 / scale})`) }} 
                    >
                        <TitleEditor id={id} imageId={imageId} data={data} setIsTitleEditorVisible={setIsTitleEditorVisible} />
                    </animated.div>
                }
                
            </animated.div>
        </>
    )
}

export default ObjectItem