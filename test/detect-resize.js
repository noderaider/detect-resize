import rewire from 'rewire'
const should = require('chai').should()

describe('lib', () => {
  const { addResizeListener, removeResizeListener } = rewire('../lib')


  describe('#addResizeListener', () => {
    it('should be a universal export', () => should.exist(addResizeListener))
    it('should be a function', () => addResizeListener.should.be.a('function'))
  })
  describe('#removeResizeListener', () => {
    it('should be a universal export', () => should.exist(removeResizeListener))
    it('should be a function', () => removeResizeListener.should.be.a('function'))
  })
})
