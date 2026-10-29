<template>
	<section
		v-if="relatedCourses.data?.length"
		class="mt-10"
		:aria-labelledby="headingId"
	>
		<div class="flex items-center justify-between mb-6">
			<h2 :id="headingId" class="text-3xl-semibold text-ink-gray-9">
				{{ __('Related Courses') }}
			</h2>
		</div>
		<div
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4"
		>
			<CourseCard
				v-for="course in relatedCourses.data"
				:key="course.name"
				:course="course"
				:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
				external
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
import { createResource } from 'frappe-ui'
import { watch, useId } from 'vue'
import CourseCard from '@/components/CourseCard.vue'
import type { LMSCourse } from '@/types/lms/LMSCourse'
import type { Resource } from '@/types'

const headingId = useId()

const props = defineProps<{
	courseName: string
}>()

const relatedCourses = createResource({
	url: 'lms.lms.utils.get_related_courses',
	cache: ['related_courses', props.courseName],
	makeParams() {
		return {
			course: props.courseName,
		}
	},
	auto: Boolean(props.courseName),
}) as Resource<LMSCourse[] | null>

watch(
	() => props.courseName,
	() => {
		if (props.courseName) relatedCourses.reload()
	}
)
</script>
