/***
 * The renderHandle function within the following component is based on the default handle prop value located here:
 * https://github.com/react-component/slider/blob/af77a4c7fb/src/common/createSlider.tsx#L32
 *
 * It is licensed under the MIT License below.
 *
 * The MIT License (MIT)
 * Copyright (c) 2015-present Alipay.com, https://www.alipay.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */



import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import RCSlider, { Handle } from 'rc-slider'
import { useCallback } from 'react'





export default function Slider (props) {
  const {
    Component = RCSlider,
    handleIcon: iconId,
    iconProps = {},
    ...restProps
  } = props

  const renderHandle = useCallback((sliderProps) => {
    const { index, ...restSliderProps } = sliderProps
    delete restSliderProps.dragging
    if (restSliderProps.value === null) {
      return null
    }

    return (
      <Handle key={index} {...restSliderProps}>
        {
          iconId && (
            <FontAwesomeIcon
              fixedWidth
              className="rc-slider-handle-icon"
              {...iconProps}
              icon={iconId} />
          )
        }
      </Handle>
    )
  }, [iconProps, iconId])

  return (
    <Component
      handle={renderHandle}
      {...restProps} />
  )
}
