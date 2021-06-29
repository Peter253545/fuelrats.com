import { NextApiRequest, NextApiResponse } from 'next'

import bind from '~/util/decorators/bind'
import createResource from '~/util/jsonapi/createResource'
import { InternalServerApiError, JSONApiError } from '~/util/server/errors'

/**
 * Context object for JsonApiRoute endpoints
 */
export default class JsonApiContext {
  req = null
  res = null
  state = {}
  meta = {}

  #resData = null
  #resIncluded = []
  #resErrors = []

  /**
   * @param {NextApiRequest} req
   * @param {NextApiResponse} res
   */
  constructor (req, res) {
    this.req = req
    this.res = res

    this.createResource = createResource.bind(null, null)
  }

  /**
   * @param {object} data
   * @returns {JsonApiContext}
   */
  @bind
  send (data) {
    if (Array.isArray(data)) {
      this.#resData = data.map(createResource.bind(null, data[0]?.type))
    } else {
      this.#resData = createResource(null, data)
    }

    return this
  }

  /**
   * @param {JSONApiError} error
   * @param {boolean} first
   * @returns {JsonApiContext}
   */
  @bind
  error (error, first) {
    if (error) {
      this.#resErrors[first ? 'unshift' : 'push'](
        error instanceof JSONApiError
          ? error
          : new InternalServerApiError({ internalError: error }),
      )
    }

    return this
  }

  /**
   * @param {number} statusCode
   * @returns {JsonApiContext}
   */
  @bind
  status (statusCode) {
    this.res.status(statusCode)
    return this
  }

  /**
   * @param {object | object[]} data
   * @returns {JsonApiContext}
   */
  @bind
  include (data) {
    if (Array.isArray(data)) {
      this.#resIncluded.append(data.map(createResource.bind(null, null)))
    } else {
      this.#resIncluded.push(createResource(null, data))
    }
    return this
  }


  /**
   * @returns {object}
   */
  @bind
  toJSON () {
    const errors = this.#resErrors

    return {
      data: errors.length ? undefined : this.#resData,
      included: errors.length ? undefined : this.#resIncluded,
      errors: errors.length ? errors : undefined,
      meta: this.meta,
      jsonapi: {
        version: '1.0',
      },
    }
  }

  /**
   * @returns {any}
   */
  get data () {
    return this.#resData
  }

  /**
   * @returns {object[]}
   */
  get included () {
    return this.#resIncluded
  }

  /**
   * @returns {JSONApiError[]}
   */
  get errors () {
    return this.#resErrors
  }
}
