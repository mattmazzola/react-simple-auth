import RSA, { IProvider } from '../src/react-simple-auth'

/**
 * Authentication Service Tests
 */
describe('Authentication Service', () => {
  const providerMocks: { [x: string]: jest.Mock<any> } = {
    buildAuthorizeUrl: jest.fn(),
    extractError: jest.fn(),
    extractSession: jest.fn(),
    validateSession: jest.fn(),
    getAccessToken: jest.fn(),
    getSignOutUrl: jest.fn()
  }

  const storageMocks: { [x: string]: jest.Mock<any> } = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }

  const windowMocks: { [x: string]: jest.Mock<any> } = {
    open: jest.fn()
  }

  const mockProvider: IProvider<{}> = providerMocks as any
  const mockStorage: Storage = storageMocks as any
  const mockWindow: Window = windowMocks as any

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('acquireTokenAsync', () => {
    it('should call provider.buildAuthorizeUrl', async () => {
      // Arrange
      windowMocks.open.mockImplementation((url, requestKey, options) => {
        storageMocks.getItem.mockReturnValue('fake-redirect-url')
        return { closed: true }
      })

      // Act
      const session = await RSA.acquireTokenAsync(
        mockProvider,
        mockStorage,
        mockWindow
      )

      // Assert
      expect(providerMocks.buildAuthorizeUrl.mock.calls.length).toBe(1)
    })

    it('should throw error if storage for request key was undefined or empty after window was closed', async () => {
      // Arrange
      windowMocks.open.mockReturnValue({ closed: true })

      // Act
      try {
        await RSA.acquireTokenAsync(mockProvider, mockStorage, mockWindow)
      } catch (e) {
        // Assert
        expect(() => {
          throw e
        }).toThrowError()
      }
    })

    it('should call provider.extractError with redirectUrl and reject if truthy', async () => {
      // Arrange
      const testRedirectUrl = 'fake-redirect-url'
      windowMocks.open.mockImplementation((url, requestKey, options) => {
        storageMocks.getItem.mockReturnValue(testRedirectUrl)
        return { closed: true }
      })

      providerMocks.extractError.mockReturnValue(
        new Error('invalid credentials')
      )

      // Act
      try {
        await RSA.acquireTokenAsync(mockProvider, mockStorage, mockWindow)
      } catch (e) {
        // Assert
        expect(providerMocks.extractError.mock.calls.length).toBe(1)
        const [calledRedirectUrl] = providerMocks.extractError.mock.calls[0]
        expect(calledRedirectUrl).toEqual(testRedirectUrl)
        expect(() => {
          throw e
        }).toThrowError()
      }
    })

    it('should call provider.extractSession with redirectUrl save as session and return value', async () => {
      // Arrange
      const testRedirectUrl = 'fake-redirect-url'
      const testSession = { foo: 'bar' }
      windowMocks.open.mockImplementation((url, requestKey, options) => {
        storageMocks.getItem.mockReturnValue(testRedirectUrl)
        return { closed: true }
      })

      providerMocks.extractError.mockReturnValue(undefined)
      providerMocks.extractSession.mockReturnValue(testSession)

      // Act
      const session = await RSA.acquireTokenAsync(
        mockProvider,
        mockStorage,
        mockWindow
      )

      // Assert
      expect(providerMocks.extractSession.mock.calls.length).toBe(1)
      const [calledRedirectUrl] = providerMocks.extractSession.mock.calls[0]
      expect(calledRedirectUrl).toEqual(testRedirectUrl)
      expect(session).toBe(testSession)
    })

    it('will wait for window to be closed before', async () => {
      // Arrange
      const testRedirectUrl = 'fake-redirect-url'
      const testSession = { foo: 'bar' }
      const mockOpenedWindow = { name: 'testWindow', closed: false }
      windowMocks.open.mockImplementation((url, requestKey, options) => {
        storageMocks.getItem.mockReturnValue(testRedirectUrl)
        setTimeout(() => {
          mockOpenedWindow.closed = true
        }, 500)
        return mockOpenedWindow
      })

      providerMocks.extractError.mockReturnValue(undefined)
      providerMocks.extractSession.mockReturnValue(testSession)

      // Act
      const session = await RSA.acquireTokenAsync(
        mockProvider,
        mockStorage,
        mockWindow
      )

      // Assert
      expect(providerMocks.extractSession.mock.calls.length).toBe(1)
      expect(session).toBe(testSession)
    })
  })

  describe('restoreSession', () => {
    it('should return undefined if session does not exist', () => {
      // Arrange

      // Act
      const session = RSA.restoreSession(mockProvider, mockStorage)

      // Assert
      expect(session).toBeUndefined()
    })

    it('should return undefined if session exists but is invalid', () => {
      // Arrange
      storageMocks.getItem.mockReturnValue('{}')
      providerMocks.validateSession.mockReturnValue(false)

      // Act
      const session = RSA.restoreSession(mockProvider, mockStorage)

      // Assert
      expect(session).toBeUndefined()
    })

    it('should return session if it is defined and valid', () => {
      // Arrange
      storageMocks.getItem.mockReturnValue('{}')
      providerMocks.validateSession.mockReturnValue(true)

      // Act
      const session = RSA.restoreSession(mockProvider, mockStorage)

      // Assert
      expect(session).toEqual({})
    })
  })

  describe('invalidateSession', () => {
    it('should remove the session from storage', () => {
      // Arrange

      // Act
      RSA.invalidateSession(mockStorage)

      // Assert
      expect(storageMocks.removeItem.mock.calls.length).toBe(1)
    })
  })

  describe('getAccessToken', () => {
    it('should throw error if session does not exist', () => {
      // Arrange
      storageMocks.getItem.mockReturnValue(undefined)

      // Act
      const action = () => RSA.getAccessToken(mockProvider, '', mockStorage)

      // Assert
      expect(action).toThrowError()
    })

    it('should call provider.getAccessToken with session and resourceId and return value', () => {
      // Arrange
      const testSession: any = { foo: 'bar' }
      const testAccessToken = 'test-access-token'
      storageMocks.getItem.mockReturnValue(JSON.stringify(testSession))
      providerMocks.getAccessToken.mockReturnValue(testAccessToken)

      // Act
      const accessToken = RSA.getAccessToken(mockProvider, '', mockStorage)

      // Assert
      expect(providerMocks.getAccessToken.mock.calls.length).toBe(1)
      const [session, resourceId] = providerMocks.getAccessToken.mock.calls[0]
      expect(session).toEqual(testSession)
      expect(resourceId).toEqual('')
      expect(accessToken).toEqual(testAccessToken)
    })
  })
})
