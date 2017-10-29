import AuralCoding from './aural-coding'

interface IAuralCoding {
  auralCoding?: AuralCoding,
  isActivated: Function,
  activate: Function,
  deactivate: Function,
}

const wrapper: IAuralCoding = {
  auralCoding: null,

  isActivated() {
    return !!this.auralCoding
  },

  activate() {
    return this.auralCoding = new AuralCoding()
  },

  deactivate() {
    if (this.auralCoding != null) {
      // this.auralCoding.unsubscribe && this.auralCoding.unsubscribe()
    }
    return this.auralCoding = null
  }
}

export default wrapper
