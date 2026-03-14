import { useParams } from "react-router-dom";
import AgentForm from "./AgentForm";

const AdminEditAgent = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <p>Missing agent ID</p>;
  return <AgentForm agentId={id} />;
};

export default AdminEditAgent;
