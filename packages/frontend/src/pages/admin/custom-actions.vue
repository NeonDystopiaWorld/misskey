<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div class="_gaps">
			<MkButton @click="recreateURLCache"><i class="ti ti-bulb-off"></i> Recreate URL cache</MkButton>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import * as os from '@/os.js';
import { definePage } from '@/page.js';
import MkButton from '@/components/MkButton.vue';

function recreateURLCache() {
	os.apiWithDialog('admin/recreate-url-cache', {});
}

definePage(() => ({
	title: 'Custom Actions',
	icon: 'ti ti-settings',
}));
</script>
