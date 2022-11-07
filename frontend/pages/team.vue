<template>
  <b-container class="page-team pt-4">
    <h1 class="mb-4">Polkastats team</h1>
    <b-row class="pt-4">
      <b-card-group deck>
        <b-col
          v-for="member in members"
          :key="member.name"
          sm="12"
          md="6"
          lg="3"
          class="member mb-3 pb-3"
        >
          <b-card
            :title="member.name"
            :img-src="member.picture"
            img-alt="Image"
            img-top
            class="h-100"
          >
            {{ member.description }}
          </b-card>
        </b-col>
      </b-card-group>
    </b-row>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      members: [
        {
          name: 'Mario',
          picture: '/img/team/Mario.jpg',
          description:
            'Founder & dev lead, full stack developer / Susbtrate lover',
        },
        {
          name: 'Fredy',
          picture: '/img/team/Fredy.jpg',
          description:
            'DragonStake founder, inflexible product owner and sysadmin guru',
        },
      ],
    }
  },
  head() {
    return {
      title: this.$t('pages.team.head_title'),
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$t('pages.team.head_content'),
        },
      ],
    }
  },
}
</script>

<style scoped>
.center {
  justify-content: center;
}
.member {
  margin: 0;
  padding: 0;
}

@media (max-width: 991px) {
  .member {
    padding-bottom: 1.5rem;
  }
}

@media (max-width: 575px) {
  .member {
    padding: 1rem;
  }
}
</style>
