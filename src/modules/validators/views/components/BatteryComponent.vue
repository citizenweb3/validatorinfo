<template>
    <div class="battery"></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BatteryComponent',
    props: {
        batteryHealth: {
            type: Number,
            default: 50,
        },
    },
    setup() {
        return {}
    },
});
</script>

<style lang="css" scoped></style>