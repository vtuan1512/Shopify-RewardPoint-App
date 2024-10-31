import db from '../db.server';
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const id = parseInt(formData.get("id"), 10);

  if (id) {
    try {
      await db.CustomerPoint.delete({
        where: { id: id },
      });
      return json({ success: "Customer point deleted successfully!" });
    } catch (error) {
      console.error("Error deleting customer point:", error);
      return json({ error: "Failed to delete customer point." }, { status: 500 });
    }
  } else {
    return json({ error: "Invalid ID provided." }, { status: 400 });
  }
};

