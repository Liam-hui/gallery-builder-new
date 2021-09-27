import React from 'react'
import { CustomPicker } from 'react-color'
const { Saturation, Hue } = require('react-color/lib/components/common')

const SaturationPointer = () => {
    return (
      <div className='color-pointer' />
    )
}

const HuePointer = () => {
    return (
      <div className='color-pointer' style={{ transform: `translate(-8px, 1px)`}} />
    )
}

const ColorPicker = (props) => {

    return (
        <div className="color-picker">
         <div className="saturation-wrapper">
                <Saturation
                    {...props}
                    pointer={SaturationPointer}
                    onChange={props.onChange} 
                />
            </div>
            <div className="hue-wrapper">
                <Hue
                    {...props}
                    pointer={HuePointer}
                    onChange={props.onChange} 
                    direction={'horizontal'}
                />
            </div>
        </div>
    )
}

export default CustomPicker(ColorPicker)