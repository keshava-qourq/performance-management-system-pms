import * as React from "react";
import { useForm } from "react-hook-form";

import * as UI from "@/lib/ui";
import { FieldErrors } from "@/lib/employees";
import { useProfile, useUpdateProfile, useUploadPhoto } from "@/lib/profile";

const { Avatar, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } =
  UI;

type FormValues = { display_name: string; pronouns: string };

const Err = ({ id, text }: { id: string; text?: string }) =>
  text ? (
    <p id={id} role="alert" className="text-sm text-red-600">
      {text}
    </p>
  ) : null;

export default function Screen() {
  const profile = useProfile();
  const update = useUpdateProfile();
  const upload = useUploadPhoto();
  const form = useForm<FormValues>({ defaultValues: { display_name: "", pronouns: "" } });
  const [notice, setNotice] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [photoError, setPhotoError] = React.useState("");
  const data = profile.data;

  React.useEffect(() => {
    if (data) form.reset({ display_name: data.display_name ?? "", pronouns: data.pronouns ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.display_name, data?.pronouns]);

  if (profile.isLoading)
    return (
      <p role="status" className="p-6">
        {"Loading your profile…"}
      </p>
    );
  if (profile.isError || !data)
    return (
      <p role="alert" className="p-6 text-red-600">
        {"Your profile could not be loaded. Try again."}
      </p>
    );

  const errors = form.formState.errors;
  const shownName = data.display_name || data.full_name;

  const onSave = form.handleSubmit(async (values) => {
    setNotice("");
    setFormError("");
    try {
      await update.mutateAsync(values);
      setNotice("Profile saved.");
    } catch (error) {
      if (error instanceof FieldErrors) {
        for (const [field, message] of Object.entries(error.errors))
          form.setError(field as keyof FormValues, { message });
      } else setFormError(error instanceof Error && error.message ? error.message : "Not saved.");
    }
  });

  const onPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setNotice("");
    try {
      await upload.mutateAsync(file);
      setNotice("Photo updated.");
    } catch (error) {
      setPhotoError(
        error instanceof FieldErrors
          ? (error.errors.photo ?? error.message)
          : "The photo could not be uploaded.",
      );
    }
  };

  const hrRows: Array<[string, string]> = [
    ["Job title", data.job_title?.name ?? "—"],
    ["Department", data.department?.name ?? "—"],
    ["Manager", data.manager?.full_name ?? "—"],
    ["Role", data.role],
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">{"My profile"}</h1>
      {notice ? (
        <p role="status" className="text-sm">
          {notice}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{"About you"}</CardTitle>
          <CardDescription>{"You can change these details yourself."}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              name={shownName}
              src={data.photo_url ?? undefined}
              className="h-16 w-16 text-base"
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="photo">{"Profile photo"}</Label>
              <input id="photo" type="file" accept="image/*" onChange={onPhoto} />
              <Err id="photo-e" text={photoError} />
            </div>
          </div>
          <form onSubmit={onSave} noValidate className="flex flex-col gap-4">
            {formError ? <Err id="form-e" text={formError} /> : null}
            <div className="flex flex-col gap-1">
              <Label htmlFor="display_name">{"Display name"}</Label>
              <Input
                id="display_name"
                aria-invalid={errors.display_name ? true : undefined}
                {...form.register("display_name")}
              />
              <Err id="display_name-e" text={errors.display_name?.message} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="pronouns">{"Pronouns"}</Label>
              <Input
                id="pronouns"
                aria-invalid={errors.pronouns ? true : undefined}
                {...form.register("pronouns")}
              />
              <Err id="pronouns-e" text={errors.pronouns?.message} />
            </div>
            <div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {"Save profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{"Work details"}</CardTitle>
          <CardDescription>{"Maintained by HR. Ask HR to change these."}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[10rem_1fr] gap-2 text-sm">
            <dt>{"Name"}</dt>
            <dd>{data.full_name}</dd>
            <dt>{"Work email"}</dt>
            <dd>{data.work_email ?? "—"}</dd>
            {hrRows.map(([label, value]) => (
              <React.Fragment key={label}>
                <dt>{label}</dt>
                <dd>
                  <span aria-label={label}>{value}</span> <UI.Badge>{"Maintained by HR"}</UI.Badge>
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
