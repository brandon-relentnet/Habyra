import { defineNuxtPlugin } from '#app'
import { onClickOutside } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('on-click-outside', {
    mounted(el, binding) {
      if (typeof window === 'undefined') return

      const capture = !binding.modifiers?.bubble
      if (typeof binding.value === 'function') {
        el.__onClickOutside_stop = onClickOutside(el, binding.value, { capture })
      } else {
        const [handler, options] = binding.value
        el.__onClickOutside_stop = onClickOutside(el, handler, { ...options, capture })
      }
    },
    unmounted(el) {
      if (el.__onClickOutside_stop) {
        el.__onClickOutside_stop()
      }
    }
  })

  nuxtApp.provide('dropdownHandler', (state) => {
    return (event) => {
      console.log('Clicked outside:', event)
      state.value = false
    }
  })
})