<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  error: String,
  disabled: Boolean,
  required: Boolean,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-1.5">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="[
        'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition',
        'focus:border-green-500 focus:ring-2 focus:ring-green-100',
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white',
        disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
      ]"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

