<template>
  <div class="min-h-screen flex items-center justify-center page-shell relative">
    <div class="absolute top-4 right-4">
      <CvLocaleSwitch compact :persist="false" />
    </div>
    <slot />
  </div>
</template>
