import { Form } from "@remix-run/react";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";

export default function CreateListingPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>Create Listing</H1>
        <p>Please enter the details of the trade you would like to make.</p>
        <Form method="POST">
          <Button type="submit">Submit</Button>
        </Form>
      </div>
    </div>
  );
}
