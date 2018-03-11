// Module imports
import Cookies from 'js-cookie'
import fetch from 'isomorphic-fetch'
import LocalForage from 'localforage'





// Component imports
import { ApiError } from '../errors'
import { Router } from '../../routes'
import actionTypes from '../actionTypes'
import initialState from '../initialState'




const dev = preval`module.exports = process.env.NODE_ENV !== 'production'`





export const addNickname = (nickname, password) => async dispatch => {
  dispatch({ type: actionTypes.ADD_NICKNAME })

  try {
    const token = Cookies.get('access_token')

    let response = await fetch('/api/nicknames', {
      body: JSON.stringify({
        nickname,
        password,
      }),
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      method: 'post',
    })

    response = await response.json()

    if (response.errors) {
      throw new ApiError(response)
    }

    dispatch({
      status: 'success',
      type: actionTypes.ADD_NICKNAME,
      payload: nickname,
    })
    return null
  } catch (error) {
    dispatch({
      status: 'error',
      type: actionTypes.ADD_NICKNAME,
    })
    return error
  }
}





export const getUser = () => async dispatch => {
  dispatch({ type: actionTypes.GET_USER })

  try {
    const token = Cookies.get('access_token')

    if (!token) {
      throw new Error('Bad access token')
    }

    let response = await fetch('/api/profile', {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
      }),
      method: 'get',
    })

    response = await response.json()

    if (response.errors) {
      throw new ApiError(response)
    }

    const user = { ...response.data }

    let userPreferences = null

    if (user.attributes.data && user.attributes.data.website && user.attributes.data.website.preferences) {
      userPreferences = user.attributes.data.website.preferences
    } else {
      userPreferences = { ...initialState.user.preferences }
    }

    Cookies.set('access_token', token, { expires: 365 })
    Cookies.set('user_id', user.id, { expires: 365 })

    if (userPreferences.allowUniversalTracking) {
      Cookies.set('trackableUserId', user.id, dev ? { domain: '.fuelrats.com' } : {})
    }

    await LocalForage.setItem('preferences', userPreferences)

    dispatch({
      status: 'success',
      type: actionTypes.GET_USER,
      payload: response,
    })

    return null
  } catch (error) {
    Cookies.remove('access_token')
    Cookies.remove('user_id')
    await LocalForage.removeItem('preferences')

    dispatch({
      status: 'error',
      type: actionTypes.GET_USER,
    })

    /* eslint-disable no-restricted-globals */
    Router.push(location.pathname === '/' ? '/' : `/?authenticate=true&destination=${encodeURIComponent(location.pathname.concat(location.search))}`)
    /* eslint-enable */

    return error
  }
}





export const updateUser = (user) => async dispatch => {
  dispatch({ type: actionTypes.UPDATE_USER })

  try {
    const token = Cookies.get('access_token')

    let response = await fetch(`/api/users/${user.id}`, {
      body: JSON.stringify(user),
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
      method: 'put',
    })

    response = await response.json()

    if (response.errors) {
      throw new ApiError(response)
    }

    dispatch({
      status: 'success',
      type: actionTypes.UPDATE_USER,
      user: response.data,
    })
    return null
  } catch (error) {
    dispatch({
      status: 'error',
      type: actionTypes.UPDATE_USER,
    })
    return error
  }
}
