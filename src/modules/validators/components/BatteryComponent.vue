<template>
    <div class="flex flex-wrap justify-center">
        <div class="battery-wrapper">
            <div class="shadow rounded border-2 border-gray-400 flex my-1 relative battery-panel">
                <div class="border-r-8 h-4 rounded-r absolute flex border-gray-400 z-10 battery-left"></div>
                <div class="cursor-default bg-green-400 text-xs font-bold leading-none flex items-center justify-center m-1 text-center text-white"
                    :style="{ 'width': batteryLevel + '%' }">
                    <div class="absolute text-gray-700 battery-text">{{ batteryLevel }}%</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BatteryComponent',
    props: {
        batteryLevel: {
            type: Number,
            default: 50,
        },
    },
    setup() {
        return {}
    },
});
</script>

<style lang="scss" scoped>
.battery-panel {
    height: 25px;
    width: 70px;

    .battery-left {
        margin-left: 4.2rem;
        margin-top: 0.15rem;
        width: 7px;
    }

    .battery-text {
        left: 0;
        right: 0;
        font-size: 11px;
    }
}
</style>