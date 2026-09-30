<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  error: String,
  disabled: Boolean,
  required: Boolean,
  noSpin: Boolean,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-semibold text-gray-700 mb-1.5">
      {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition',
        'focus:border-green-500 focus:ring-2 focus:ring-green-100',
        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white',
        disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
        noSpin && 'no-spin',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>

