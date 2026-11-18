import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageBreadcrumb } from "@/components/common/page-breadcrumb";
import { getPosterBoardStatsByDistrictAction } from "@/features/map-poster/actions/poster-boards";
import DetailedPosterMapClient from "@/features/map-poster/components/detailed-poster-map-client";
import { getDistrictsWithBoards } from "@/features/map-poster/loaders/poster-boards-loaders";
import { createClient } from "@/lib/supabase/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ district: string }>;
}): Promise<Metadata> {
  const { district: districtKey } = await params;

  const validDistricts = await getDistrictsWithBoards();
  const matchedDistrict = validDistricts.find(
    (d) => d.toLowerCase().replace(/[^a-z0-9]/g, "-") === districtKey,
  );

  if (matchedDistrict) {
    return {
      title: `${matchedDistrict}のポスター掲示板マップ`,
      description: `${matchedDistrict}のポスター掲示板の配置状況を確認できます`,
    };
  }

  return {
    title: "ポスター掲示板マップ",
    description: "ポスター掲示板の配置状況を確認できます",
  };
}

export default async function DistrictPosterMapPage({
  params,
}: {
  params: Promise<{ district: string }>;
}) {
  const { district: districtKey } = await params;

  const validDistricts = await getDistrictsWithBoards();
  const matchedDistrict = validDistricts.find(
    (d) => d.toLowerCase().replace(/[^a-z0-9]/g, "-") === districtKey,
  );

  if (!matchedDistrict) {
    return redirect("/map/poster");
  }

  const districtJp = matchedDistrict;
  const center: [number, number] = [36.2048, 138.2529];
  const defaultZoom = 6;
  const stats = await getPosterBoardStatsByDistrictAction(districtJp);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 pt-4">
        <PageBreadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ポスター掲示板マップ", href: "/map/poster" },
            { label: districtJp },
          ]}
        />
      </div>
      <DetailedPosterMapClient
        userId={user?.id}
        prefecture={districtJp}
        prefectureName={districtJp}
        center={center}
        initialStats={stats}
        boardTotal={null}
        userEditedBoardIds={[]}
        defaultZoom={defaultZoom}
        isDistrict={true}
      />
    </>
  );
}
