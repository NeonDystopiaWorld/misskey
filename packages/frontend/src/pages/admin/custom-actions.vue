<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 700px; --MI_SPACER-min: 16px; --MI_SPACER-max: 32px;">
		<div class="_gaps">
			<MkInfo>
				Removes unread 1:1 chat markers whose sender account is deleted or missing.
			</MkInfo>
			<MkButton danger @click="cleanup">
				<i class="ti ti-trash"></i> Clean up orphaned chat unreads
			</MkButton>
			<MkInfo v-if="cleaned != null">
				Cleaned {{ cleaned }} unread marker{{ cleaned === 1 ? '' : 's' }}.
			</MkInfo>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkButton from '@/components/MkButton.vue';
import MkInfo from '@/components/MkInfo.vue';
import * as os from '@/os.js';
import { i18n } from '@/i18n.js';
import { definePage } from '@/page.js';

const cleaned = ref<number | null>(null);

async function cleanup() {
	const { canceled } = await os.confirm({
		type: 'warning',
		title: i18n.ts.areYouSure,
		text: 'This removes orphaned unread chat markers from Redis.',
	});
	if (canceled) return;

	const result = await os.apiWithDialog('admin/cleanup-chat-unreads', {});
	cleaned.value = result.cleaned;
}

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

definePage(() => ({
	title: 'Custom actions',
	icon: 'ti ti-message',
}));
</script>
