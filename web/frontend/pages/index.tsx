import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { Options, Toast } from "@shopify/app-bridge-core/actions/Toast";
import { trophyImage } from "../assets";
import { ProductsCard } from "../components";
import { useFetch } from "../providers/ShopifyApp";
import { useEffect } from "react";
// Interfaces
import {
  BADGE_DICTIONARY,
  ITask,
  TYPE_NAME_DICTIONARY,
  TaskPriority,
  TaskState,
  TaskType,
  TaskTypes,
} from "../interfaces/TaskInterfaces";
import {
  TOAST_REASON,
  TOAST_REASON_RESULT,
  ToastReason,
} from "../interfaces/AppInterfaces";
import { ClientApplication } from "@shopify/app-bridge-core/client/types";
import SocketStore from "../store/SocketStore";
import { state as NavigationState } from "../store/NavigationStore";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../store/ConfigStore";
import { methods as ShopifyMethods } from "../store/ShopifyAppStore";
import { isEmpty, useAxios, debounce } from "../providers/utils";
import axios from "axios";
import { state as taskState, methods, computeds } from '../store/TaskDetailsStore'

export default function HomePage() {
  let totalVariantCount;
  let selectValue = "";

  const scheduleState = {
    value: new Date().toDateString(),
    modalActive: false,
    primaryAction: {
      content: "Schedule",
      onAction: () => createNewTask(true),
      loading: false,
    },
  };

  const getVariantsCountNew = async () => {
    const variantCount = await useFetch("/api/shopify/variants/count");
    totalVariantCount = variantCount.count;
    console.log("variantCount", variantCount);
  };

  // const getTasks = async () => {
  //   const variantCount = await useFetch("/api/v1/tasks?page=0&limit=10&events=true");
  //   totalVariantCount = variantCount.count;
  //   console.log("getTasks", variantCount);
  // };

  async function createNewTask(schedule: boolean = false) {
    // processing.value = true
    // scheduleState.primaryAction.loading = true

    let { isError, message } =
      TOAST_REASON_RESULT[TOAST_REASON.TASK_CREATED_SUCCESSFULLY];

    try {
      const payload: any = {
        type: TaskType.CREATE_UPDATE_PRODUCTS,
        priority: TaskPriority.HIGH,
        automated: false,
      };

      // if (!!schedule && scheduleState.value !== todayDate) {
      //   payload.schedule = new Date(scheduleState.value).toISOString();
      // }

      const { data } = await useAxios({
        method: "POST",
        uri: "/api/v1/tasks",
        payload,
      });

      selectValue = "";
      // getTasks();
    } catch (err: any) {
      console.error(err);
      isError = true;
      message =
        err.response.data.message ||
        TOAST_REASON_RESULT[TOAST_REASON.TASK_CREATION_ERROR].message;
    }

    // Toast.create(ShopifyApp, {
    //   duration: 3000,
    //   message,
    //   isError,
    // }).dispatch(Toast.Action.SHOW);

    scheduleState.primaryAction.loading = false;
    scheduleState.modalActive = false;
    // processing.value = false;
  }

  const fetchConfig = () => ({
    headers: {
      "X-Innovate-Token": `Bearer ${state.sessionToken}`,
      "X-Innovate-Refresh-Token": state.refreshToken,
      "Content-Type": `application/json`,
    },
  });

  const brandOptions = () => {
    return state.brands
      .filter(
        (brand) => !state.config.apiBrandIds?.includes(String(brand.Brand_Id))
      )
      .map((brand) => ({
        value: String(brand.Brand_Id),
        label: `${brand.StoreName} (${brand.Brand_Id})`,
      }));
  };

  const activeBrandOptions = () =>
    state.config.apiBrandIds?.map((bId) => {
      const thisBrand = state.brands.find(
        (x) => String(x.Brand_Id) === String(bId)
      );

      return thisBrand;
    }) || [];

  const computeds = {
    fetchConfig,
    brandOptions,
    activeBrandOptions,
  };

  const getTasks = async () => {
    try {
      const nowDate = new Date();
      // today.setUTCDate(today.getUTCDate() - 1)
      nowDate.setUTCHours(0);
      nowDate.setUTCMinutes(0);
      nowDate.setUTCSeconds(0);
      nowDate.setUTCMilliseconds(0);

      nowDate.setUTCDate(1);
      nowDate.setUTCMonth(nowDate.getUTCMonth() - 1);

      const query = {
        createdAt: {
          $gte: nowDate,
        },
      };

      const { data } = await axios.get(
        `/api/v1/tasks?page=1&query=${encodeURIComponent(
          JSON.stringify(query)
        )}&limit=250&events=true`,
        computeds.fetchConfig()
      );
      const chartInfo = data.docs.reduce((acc: any, x: any) => {
        if (typeof acc[x.type] !== "undefined") {
          acc[x.type].push(x);
          return acc;
        }

        acc[x.type] = [x];
        return acc;
      }, {});

      console.log(data);
      console.log(chartInfo);

      // chartOptions.tasks.labels.splice(
      //   0,
      //   chartOptions.tasks.labels.length,
      //   ...Object.keys(chartInfo).map(
      //     (l) => TYPE_NAME_DICTIONARY[l as TaskTypes]
      //   )
      // );
      // chartOptions.tasks.series.splice(
      //   0,
      //   chartOptions.tasks.series.length,
      //   ...Object.values(chartInfo).map((x: any) => x.length)
      // );

      // console.log(chartOptions);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    ConfigMethods.signIn().then((e) => {
      debugger;
      console.log("SignIn", e);
      ConfigMethods.getConfig().then((e) => {
        getTasks();
        const taskId = '66ef2cc8099341768a96bbd9'
        taskState.taskId = taskId;
        // methods.getTask();
      });
    });

  });

  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>Nice work on building a Shopify app 🎉</Heading>
                  <p>
                    Your app is ready to explore! It contains everything you
                    need to get started including the{" "}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{" "}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{" "}
                    <Link
                      url="https://shopify.dev/apps/tools/app-bridge"
                      external
                    >
                      App Bridge
                    </Link>{" "}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.{" "}
                  </p>
                  <p>
                    Learn more about building out your app in{" "}
                    <Link
                      url="https://shopify.dev/apps/getting-started/add-functionality"
                      external
                    >
                      this Shopify tutorial
                    </Link>{" "}
                    📚{" "}
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImage}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        {/* <Layout.Section>
          <ProductsCard />
        </Layout.Section> */}
      </Layout>
    </Page>
  );
}
