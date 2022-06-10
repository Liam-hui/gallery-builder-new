import React, { useState, useRef } from 'react'
import { useGesture } from 'react-use-gesture'
import { useSelector } from "react-redux"
import { useSpring, animated, to } from 'react-spring'
import { isMobile } from 'react-device-detect'
import store from '../store'
import translate from '../utils/translate'

import Icon from '@mdi/react'
import { mdiCloseThick, mdiFormatAlignLeft, mdiFormatAlignJustify, mdiFormatAlignRight } from '@mdi/js'

import { getTitle } from '../utils/MyUtils'
import { getTitleImage } from '../api/misc'
import { adminUpdateTitle } from '../api/admin'

import ColorPicker from './ColorPicker'

const AdminEditor = ({ data, editorTopRef, id, imageId, setIsTitleEditorVisible }) => {

    const fonts = useSelector(state => state.fonts)

    const [text, setText] = useState(data.title)
    const [displayText, setDisplayText] = useState(getTitle(data.title, '{顧客輸入}'))
    const [color, setColor] = useState(data.color)
    const [align, setAlign] = useState(data.align)
    const [enFont, setEnFont] = useState(data.fonts?.en ?? fonts.en[0].id)
    const [zhFont, setZhFont] = useState(data.fonts?.['zh-hant'] ?? fonts.zh[0].id)

    const handleTextChange = (e) => {
        const getTextPart = (string, mark) => {
            const startPos = string.indexOf(mark)
            const endPos = startPos + mark.length
            return [string.substr(0, startPos), string.substr(endPos, string.length - endPos)]
        }
    
        const textPart = getTextPart(text, '{**Customer_INPUT**}')
        const displayTextPart = getTextPart(e.target.value, '{顧客輸入}')
    
        if (e.target.value.includes('{顧客輸入}') && (textPart[0] == displayTextPart[0] || textPart[1] == displayTextPart[1])) {
          setDisplayText(e.target.value)
          setText(displayTextPart[0] + '{**Customer_INPUT**}' + displayTextPart[1])
        }
    }

    const confirm = async () => {
        const title = {
            title: text,
            color,
            align,
            fonts: {
                en: enFont,
                "zh-hant": zhFont
            }
        }
        store.dispatch({ type: 'UPDATE_IMAGE_TITLE', id, imageId, data: { ...title } })

        const image = { ...store.getState().images.data[imageId] }
        image.titles[id] = {
            ...image.titles[id],
            ...title,
        }
        adminUpdateTitle(id, imageId, image)
    
        if (isMobile)
            store.dispatch({ type: 'HIDE_POPUP' })
        else
            setIsTitleEditorVisible && setIsTitleEditorVisible(false)
    }

    return (
        <>
            <div className='title-editor-top' ref={editorTopRef ?? null} style={{ "--color": color }} />
            <div className='title-align'>
                <div className='title-align-button' onClick={() => setAlign('left')} >
                    <Icon path={mdiFormatAlignLeft} size={0.6} color={align == 'left' ? "#000000" : "#999999"} />
                </div>
                <div className='title-align-button' onClick={() => setAlign('center')} >
                    <Icon path={mdiFormatAlignJustify} size={0.6} color={align == 'center' ? "#000000" : "#999999"} />
                </div>
                <div className='title-align-button' onClick={() => setAlign('right')} >
                    <Icon path={mdiFormatAlignRight} size={0.6} color={align == 'right' ? "#000000" : "#999999"} />
                </div>
            </div>
            <div className='text-input-wrapper'>
                <textarea 
                    value={displayText}
                    onChange={handleTextChange}
                    placeholder={translate('enterText')} 
                />
            </div>
        
            <ColorPicker color={color} onChange={(c) => setColor(c.hex)} />

            <div className="title-font">
            <label>English Font</label>
            <select value={enFont} onChange={(e) => setEnFont(e.target.value)}>
                {fonts.en.map(font =>
                    <option key={font.id} value={font.id}>{font.name}</option>
                )}
            </select>
            <label>Chinese Font</label>
            <select value={zhFont} onChange={(e) => setZhFont(e.target.value)}>
                {fonts.zh.map(font =>
                    <option key={font.id} value={font.id}>{font.name}</option>
                )}
            </select>
            </div>

            <div className='title-editor-bottom' onClick={confirm} >
                {translate('save')}
            </div>
            <div 
                className='title-editor-close-button' 
                onClick={() => {
                    if (isMobile)
                        store.dispatch({ type: 'HIDE_POPUP' })
                    else
                        setIsTitleEditorVisible && setIsTitleEditorVisible(false)
                }}
            >
                <Icon path={mdiCloseThick} size={0.7} color="#DDDDDD"/>
            </div>
        </>
    )
}

const UserEditor = ({ data, editorTopRef, id, imageId, setIsTitleEditorVisible }) => {

    const [text, setText] = useState("")

    const handleTextChange = (e) => {
        setText(e.target.value)
    }

    const confirm = async () => {
        const titleImage = await getTitleImage(imageId, getTitle(data.adminTitle, text?.replace(/\n/g, " ")))
        store.dispatch({ type: 'UPDATE_IMAGE_TITLE', id, imageId, data: { id: titleImage.id, url: titleImage.base64 } })

        if (isMobile)
            store.dispatch({ type: 'HIDE_POPUP' })
        else
            setIsTitleEditorVisible && setIsTitleEditorVisible(false)
    }

    return (
        <>
            <div className='title-editor-top' ref={editorTopRef ?? null} />
            <div className='text-input-wrapper'>
                <textarea 
                    value={text}
                    onChange={handleTextChange}
                    placeholder={translate('enterText')} 
                />
            </div>
            <div className='title-editor-bottom' onClick={confirm} >
                {translate('save')}
            </div>
            <div 
                className='title-editor-close-button' 
                onClick={() => {
                    if (isMobile)
                        store.dispatch({ type: 'HIDE_POPUP' })
                    else
                        setIsTitleEditorVisible && setIsTitleEditorVisible(false)
                }}
            >
                <Icon path={mdiCloseThick} size={0.7} color="#DDDDDD"/>
            </div>
        </>
    )
}

const TitleEditor = (props) => {

    const editorTopRef = useRef()
    const mode = useSelector(state => state.status.mode)
    
    return (
        isMobile ? 
            <div className='title-editor is-popup' style={mode == 'admin' ? {} : { height: 300 }} >
                {mode == 'admin' ?
                    <AdminEditor {...props} />
                :
                    <UserEditor {...props} />
                }
            </div>
        :
            <DesktopTitleEditor gestureTarget={editorTopRef} >
                {mode == 'admin' ?
                    <AdminEditor editorTopRef={editorTopRef} {...props} />
                :
                    <UserEditor editorTopRef={editorTopRef} {...props} />
                }
            </DesktopTitleEditor>
    )     
}

const DesktopTitleEditor = (props) => {

    const { gestureTarget } = props

    const [{ x, y }, set] = useSpring(() => ({
        x: 0,
        y: 0,
        config: { mass: 0, tension: 0, friction: 0 }
    }))

    useGesture(
        {
            onDrag: ({ offset }) => {
                set({
                    x: offset[0], 
                    y: offset[1], 
                })
            },
        },
        { domTarget : gestureTarget, eventOptions: { passive: false } }
    )

    return (
        <animated.div 
            className='title-editor is-float'  
            style={{
                transform: to([x, y], (x, y) => `translate(${x}px, ${y}px)`),
            }}
        >
            <div>
               {props.children}
            </div>
        </animated.div>   
    )
}

export default TitleEditor 