<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    isLoading: false,
    disabled: false,
  }
);

const attrs = useAttrs();

const variantClass = computed(() => {
  const variants: Record<Variant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20',
    secondary: 'bg-surface border border-border text-text-primary hover:border-primary hover:text-primary',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-light',
    danger: 'bg-danger text-white hover:bg-danger/90',
  };
  return variants[props.variant];
});

const sizeClass = computed(() => {
  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-small',
    md: 'h-9 px-4 text-body',
    lg: 'h-11 px-6 text-body',
  };
  return sizes[props.size];
});
</script>

<template>
  <button
    v-bind="attrs"
    :disabled="props.disabled || props.isLoading"
    :class="
      cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClass,
        sizeClass
      )
    "
  >
    <svg
      v-if="props.isLoading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot name="leftIcon" v-else />
    <slot />
    <slot name="rightIcon" v-if="!props.isLoading" />
  </button>
</template>
