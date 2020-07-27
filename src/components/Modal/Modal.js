// Module imports
import { animated, useTransition } from '@react-spring/web'
import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { useCallback, useMemo, useContext } from 'react'





// Component imports
import useEventListener from '~/hooks/useEventListener'
import useMergeReducer from '~/hooks/useMergeReducer'

import ModalHeader from './ModalHeader'
import ModalPortal from './ModalPortal'




const translate3dHeight = (value) => {
  return (value ? `translate3d(0,${value}vh,0)` : undefined)
}

const ModalContext = React.createContext({})
function ModalComponent (props) {
  const {
    as = 'div',
    className,
    onClose,
    title,
    initialState,
    style,
  } = props

  const [state, setState] = useMergeReducer(initialState)

  const hideClose = state.hideClose ?? props.hideClose

  const sharedContext = useMemo(() => {
    return [{
      hideClose,
      ...state,
      onClose,
    }, setState]
  }, [hideClose, state, onClose, setState])

  const handleGlobalKeyDown = useCallback((event) => {
    if (event.code === 'Escape') {
      onClose()
    }
  }, [onClose])
  useEventListener('keydown', handleGlobalKeyDown, { listen: !hideClose })

  const {
    Component,
    children: innerChildren,
    props: innerProps,
  } = props.children

  const RootElement = animated[as]

  return (
    <ModalContext.Provider value={sharedContext}>
      <RootElement
        className={['modal', className]}
        role="dialog"
        style={{ transform: style.pos.to(translate3dHeight) }}>

        <ModalHeader
          hideClose={hideClose}
          title={title}
          onClose={onClose} />

        <Component {...innerProps}>
          {innerChildren}
        </Component>
      </RootElement>
    </ModalContext.Provider>
  )
}

function renderModal (style, item) {
  const { children, ...props } = item
  return item.isOpen && (
    <ModalComponent {...props} style={style}>
      {children}
    </ModalComponent>
  )
}

function ModalTransitionContainer (props) {
  const { isOpen } = props

  const modalTransition = useTransition(props, {
    key: JSON.stringify(props),
    from: { pos: -100 },
    enter: { pos: 0 },
    leave: { pos: -100 },
    unique: true,
    config: {
      tension: 350,
    },
  })

  return (
    <ModalPortal isOpen={isOpen}>
      {modalTransition(renderModal)}
    </ModalPortal>
  )
}

const asModal = (options) => {
  return (Component) => {
    return hoistNonReactStatics(({ children, ...props }) => {
      return (
        <ModalTransitionContainer
          {...props}
          {...options}>
          {{ Component, children, props }}
        </ModalTransitionContainer>
      )
    }, Component)
  }
}

function useModalContext () {
  return useContext(ModalContext)
}

function withModalContext (Component) {
  return hoistNonReactStatics(({ children, ...props }) => {
    const context = useContext(ModalContext)
    return (
      <Component {...props} modalContext={context}>
        {children}
      </Component>
    )
  }, Component)
}





export default asModal
export {
  useModalContext,
  withModalContext,
}
