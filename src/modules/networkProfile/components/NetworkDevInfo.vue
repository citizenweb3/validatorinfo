<template>
  <div class="w-full">
      <div class='title title-secondary'>Dev info</div>
  </div>
  <div class='flex flex-row w-full'>
    <div class='flex-col w-1/2 pr-20 text-white border-bottom mr-20 pl-3 pb-5'>
      <div class='title title-smallest border-none'>Pre-Vote</div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='true' />
        Validator has submitted pre-vote with synchronized block hash
      </div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='false' />
        Validator has submitted pre-vote with different hash
      </div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='null' />
        Validator has not submitted pre-vote yet
      </div>
    </div>
    <div class='flex-col w-1/2 text-white border-bottom pl-3'>
      <div class='title title-smallest border-none'>Pre-Commit</div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='true' />
        Validator has submitted pre-vote with synchronized block hash
      </div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='false' />
        Validator has submitted pre-vote with different hash
      </div>
      <div class='w-full'>
        <font-awesome-icon :icon="['fas', 'square']" v-status-color='null' />
        Validator has not submitted pre-vote yet
      </div>
    </div>
  </div>
  <div class='w-full flex flex-row justify-center'>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>Peers</div>
      <div class='text-white title-secondary border-none'>47,424,924</div>
      <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
    </div>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>Seeds</div>
      <div class='text-white title-secondary border-none'>47,424,924</div>
      <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
    </div>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>Binary Versions</div>
      <div class='text-white title-secondary border-none'>47,424,924</div>
      <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
    </div>
  </div>

  <div class="w-full">
    <div class='title title-secondary'>Developer Activity</div>
  </div>
  <div class='flex flex-row w-full border-bottom'>
    <div class='flex-col w-1/7 text-white'>
      <div class='title title-smallest border-bottom pl-10'>Monthly Commits</div>
    </div>
    <div class='pt-10 pb-5'>
      <img src='@/assets/screenshots/chart_network_devinfo_monthly_commits.png' />
    </div>
  </div>
  <div class='flex flex-row w-full border-bottom'>
    <div class='flex-col w-1/5 text-white'>
      <div class='title title-smallest border-bottom pl-10'>Total Commits and Developers</div>
      <div class='px-10'>
        <div class='flex flex-col justify-center w-1/2'>
          <div class='flex flex-col justify-center h-32 border-bottom' >
            <div class='title title-secondary border-0 mx-auto mb-3'>Total Commits</div>
            <div class='text-red text-center'>3245</div>
          </div>
          <div class='flex flex-col justify-center h-32 border-bottom'>
            <div class='title title-secondary mx-auto border-0 mb-3'>Total Developers</div>
            <div class='text-green text-center'>123</div>
          </div>
        </div>
      </div>
    </div>
    <div class='pt-10 pb-5'>
      <img src='@/assets/screenshots/chart_network_devinfo_total_commits_developers.png' />
    </div>
  </div>
</template>
