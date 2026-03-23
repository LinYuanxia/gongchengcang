import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Merchant, MerchantType } from '@gongchengcang/types'
import { setMerchantInfo, removeMerchantInfo } from '@gongchengcang/utils'

export const useMerchantStore = defineStore('merchant', () => {
  const merchant = ref<Merchant | null>(null)
  const merchantType = ref<MerchantType | null>(null)

  function setMerchant(data: Merchant) {
    merchant.value = data
    merchantType.value = data.type
    setMerchantInfo(data)
  }

  function clearMerchant() {
    merchant.value = null
    merchantType.value = null
    removeMerchantInfo()
  }

  function isPlatform() {
    return merchantType.value === 'platform'
  }

  function isSupplier() {
    return merchantType.value === 'supplier'
  }

  function isConstructor() {
    return merchantType.value === 'constructor'
  }

  function isWarehouse() {
    return merchantType.value === 'warehouse'
  }

  return {
    merchant,
    merchantType,
    setMerchant,
    clearMerchant,
    isPlatform,
    isSupplier,
    isConstructor,
    isWarehouse,
  }
})
