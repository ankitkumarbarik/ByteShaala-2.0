import { PlayCircle, Lock } from "lucide-react";

import { useGetCourseSectionsQuery } from "@/actions/courseActions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CourseContent = ({ course }) => {
  const { data: sectionsData, isLoading } = useGetCourseSectionsQuery(
    course._id
  );
  const sections = sectionsData?.data || [];

  // Calculate total lectures and duration
  const totalLectures = sections.reduce(
    (acc, section) => acc + (section.lecturesCount || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-6">Course content</h3>
        <div className="text-gray-400">Loading sections...</div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-6">Course content</h3>
        <div className="text-gray-400">No sections available yet.</div>
      </div>
    );
  }
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Course content</h3>
      <div className="mb-6 text-gray-300">
        {sections.length} sections • {totalLectures} lectures •{" "}
        {course?.duration} total length
      </div>

      <Accordion type="multiple" className="w-full">
        {sections.map((section, index) => (
          <AccordionItem
            key={section._id || index}
            value={`section-${index}`}
            className="border-gray-700"
          >
            <AccordionTrigger className="text-left hover:no-underline hover:bg-gray-700/50 px-4 py-4 rounded-lg transition-colors">
              <div className="flex flex-col items-start w-full">
                <h3 className="font-semibold text-white text-base mb-1">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {section.description}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {section.lecturesCount} lectures
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              <div className="space-y-2">
                {section.lectures && section.lectures.length > 0 ? (
                  section.lectures.map((lecture, lectureIndex) => (
                    <div
                      key={lecture._id || lectureIndex}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {lecture.isPreviewFree ? (
                          <PlayCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {lecture.title}
                          </p>
                          {lecture.isPreviewFree && (
                            <span className="text-xs text-green-400">
                              Free Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm p-3">
                    No lectures available in this section yet.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default CourseContent;
