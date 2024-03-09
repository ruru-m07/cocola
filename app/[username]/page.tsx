"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import CompoLoader from "@/components/ComponentLoader";
import Loader from "@/components/Loader";
import { Repository, User } from "@prisma/client";
import {
  BookMarked,
  BookOpen,
  LayoutPanelLeft,
  Star,
  Package,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getUserByUsername } from "@/actions/user/getUserByUsername";
import Mininavigationbar from "@/components/Mini-navigationbar";
import { fetchRepoList } from "@/actions/user/fetchRepoList";
import Loader2 from "@/components/Loader2";
import { fetchUserMD } from "@/actions/user/fetchUserMD";

const Overview = dynamic(() => import("./components/Overview"), {
  loading: () => <CompoLoader />,
});
const Repositories = dynamic(() => import("./components/Repositories"), {
  loading: () => <CompoLoader />,
});
const UserSide = dynamic(() => import("./components/UserSide"), {
  loading: () => <Loader />,
});

export default function Page({ params }: { params: { username: string } }) {
  const [userdata, setUserdata] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [userrepo, setUserrepo] = useState<Repository[] | null>(null);
  const [userMd, setUserMd] = useState<string | null>(null);

  const searchParams = useSearchParams();

  const tab = searchParams?.get("tab");
  const user = useCurrentUser();

  const navigation_Items = [
    {
      name: "Overview",
      href: `/${params.username}`,
      renderedComponentName: null,
      icon: BookOpen,
      count: 0,
    },
    {
      name: "Repositories",
      href: `/${params.username}?tab=repositories`,
      renderedComponentName: "repositories",
      icon: BookMarked,
      count: 34,
    },
    {
      name: "Projects",
      href: `/${params.username}?tab=projects`,
      renderedComponentName: "projects",
      icon: LayoutPanelLeft,
      count: 1,
    },
    {
      name: "Packages",
      href: "/dashboard",
      renderedComponentName: "packages",
      icon: Package,
      count: 0,
    },
    {
      name: "Stars",
      href: "/",
      renderedComponentName: "stars",
      icon: Star,
      count: 20,
    },
  ];

  async function fetchUser(name: string) {
    const res = await getUserByUsername(name);
    if (!res) return null;
    return res;
  }

  useEffect(() => {
    fetchUser(params.username).then((res) => {
      setUserdata(res);
    });
  }, [params.username]);

  useEffect(() => {
    setLoading(true);
    fetchRepoList(params.username, user?.username).then((res) => {
      if (res.repos) {
        setUserrepo(res.repos);
      }
      setLoading(false);
    });
  }, [params.username, user?.username]);

  const fetchingMD = async () => {
    setLoading(true);
    if (!userdata?.username) return;
    const data = fetchUserMD(userdata?.username);
    return data;
  };

  useEffect(() => {
    fetchingMD()
      .then((data: any) => setUserMd(data?.data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userdata?.username]);

  let renderedComponent;
  let renderedComponentName: any;

  switch (tab) {
    case "repositories":
      renderedComponent = <Repositories userrepo={userrepo} />;
      renderedComponentName = "repositories";
      break;
    default:
      renderedComponent = (
        <Overview userdata={userdata} userMd={userMd} userrepo={userrepo} />
      );
      renderedComponentName = null;
  }

  return (
    <div className=" h-full ">
      <Mininavigationbar
        items={navigation_Items}
        renderedComponentName={renderedComponentName}
      />
      <Card className="h-full m-auto border-none shadow-none mx-28">
        <div className="mt-5">
          <div className="flex justify-between">
            <div className="w-72">
              <UserSide userdata={userdata} user={user as User} />
            </div>
            {loading ? (
              <div className="mt-10">
                <Loader2 />
              </div>
            ) : (
              <Card className="w-full p-4 ml-10 border-none shadow-none">
                {renderedComponent}
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
