import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { getStoredSessionToken } from "@/lib/session";

type Computer = {
  id: number;
  name: string;
  room: string;
  specs: string | null;
  status: string;
  created_at: string;
};

type BorrowRequest = {
  id: number;
  computer_id: number;
  borrower_id: number;
  reason: string | null;
  status: string;
  requested_at: string;
  approved_by: number | null;
  approved_at: string | null;
  returned_at: string | null;
  borrower_name?: string | null;
  borrower_username?: string | null;
};

type ComputerForm = {
  name: string;
  room: string;
  specs: string;
  status: "available" | "in_use" | "maintenance";
};

const statusStyles: Record<string, { label: string; className: string }> = {
  available: { label: "Có sẵn", className: "border-[#dfe5ee] bg-[#f3f4f6] text-[#58677a]" },
  in_use: { label: "Đang sử dụng", className: "border-[#f7d998] bg-[#fff7de] text-[#9a6700]" },
  maintenance: { label: "Bảo trì", className: "border-[#f4c7c7] bg-[#fff1f1] text-[#d14343]" },
  pending: { label: "Chờ duyệt", className: "border-[#bfd9ff] bg-[#edf5ff] text-[#1f5ecb]" },
  approved: { label: "Đã duyệt", className: "border-[#bfe8d0] bg-[#eafaf0] text-[#148d4d]" },
  rejected: { label: "Từ chối", className: "border-[#f4c7c7] bg-[#fff1f1] text-[#d14343]" },
  returned: { label: "Đã trả", className: "border-[#bfe8d0] bg-[#eafaf0] text-[#148d4d]" },
};

export default function Home() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState("");
  const [reason, setReason] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: number; username?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState<"all" | "pending" | "approved" | "rejected" | "returned">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<number | null>(null);
  const [newMachine, setNewMachine] = useState<ComputerForm>({
    name: "",
    room: "",
    specs: "",
    status: "available",
  });

  const loadData = async () => {
    try {
      const token = getStoredSessionToken();
      const [computerRes, requestRes, meRes] = await Promise.all([
        fetch("/api/computers"),
        fetch("/api/borrow-requests"),
        token
          ? fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
          : Promise.resolve(null),
      ]);

      const computerData = await computerRes.json();
      const requestData = await requestRes.json();
      const meData = meRes && meRes.ok ? await meRes.json() : null;

      setComputers(Array.isArray(computerData.computers) ? computerData.computers : []);
      setRequests(Array.isArray(requestData.requests) ? requestData.requests : []);
      setCurrentUser(
        meData?.user
          ? { id: Number(meData.user.id), username: meData.user.username, role: meData.user.role }
          : null,
      );
      setSelectedComputerId(
        Array.isArray(computerData.computers) && computerData.computers.length > 0
          ? String(computerData.computers[0].id)
          : "",
      );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setComputers([]);
      setRequests([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return [
      { label: "MÁY CÓ SẴN", value: String(computers.filter((c) => c.status === "available").length), accent: "text-[#2fbf7a]" },
      { label: "ĐANG SỬ DỤNG", value: String(computers.filter((c) => c.status === "in_use").length), accent: "text-[#f59e0b]" },
      { label: "BẢO TRÌ", value: String(computers.filter((c) => c.status === "maintenance").length), accent: "text-[#ef4444]" },
      { label: "YÊU CẦU CHỜ", value: String(requests.filter((r) => r.status === "pending").length), accent: "text-[#3b82f6]" },
    ];
  }, [computers, requests]);

  const approvalRows = useMemo(() => {
    return requests
      .filter((request) => requestFilter === "all" || request.status === requestFilter)
      .map((request) => {
        const machine = computers.find((computer) => computer.id === request.computer_id);
        const requestLabel =
          request.borrower_name?.trim() ||
          request.borrower_username?.trim() ||
          (request.borrower_id ? `User #${request.borrower_id}` : "-");
        const style = statusStyles[request.status] ?? statusStyles.pending;

        return {
          id: request.id,
          machine: machine ? machine.name : "-",
          request: requestLabel,
          reason: request.reason || "Không có lý do",
          status: style.label,
          statusClass: style.className,
        };
      });
  }, [computers, requests, requestFilter]);

  const myRequests = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return requests.filter((request) => request.borrower_id === currentUser.id);
  }, [currentUser, requests]);

  const isAdmin = currentUser?.role === "admin" || currentUser?.username === "admin";

  const handleCreateRequest = async () => {
    if (!selectedComputerId) {
      return;
    }

    const token = getStoredSessionToken();
    if (!token) {
      window.alert("Bạn cần đăng nhập để đăng ký mượn máy");
      return;
    }

    try {
      const meResponse = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meData = await meResponse.json();
      if (!meResponse.ok || !meData?.user?.id) {
        throw new Error(meData?.message ?? "Không xác định được người dùng");
      }

      const response = await fetch("/api/borrow-requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          computer_id: Number(selectedComputerId),
          borrower_id: Number(meData.user.id),
          reason: reason || "Không có lý do",
          status: "pending",
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? "Tạo yêu cầu thất bại");
      }

      setReason("");
      setSelectedComputerId(computers.length > 0 ? String(computers[0].id) : "");
      await loadData();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Tạo yêu cầu thất bại");
    }
  };

  const handleRequestStatus = async (requestId: number, status: "approved" | "rejected" | "returned") => {
    const token = getStoredSessionToken();
    if (!token) {
      window.alert("Bạn cần đăng nhập để duyệt yêu cầu");
      return;
    }

    try {
      const response = await fetch(`/api/borrow-requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          approved_by: currentUser?.id ?? 0,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? "Cập nhật trạng thái thất bại");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Cập nhật trạng thái thất bại");
    }
  };

  const closeMachineModal = () => {
    setIsCreateOpen(false);
    setEditingMachineId(null);
    setNewMachine({ name: "", room: "", specs: "", status: "available" });
  };

  const openEditMachine = (machine: Computer) => {
    setEditingMachineId(machine.id);
    setNewMachine({
      name: machine.name,
      room: machine.room,
      specs: machine.specs ?? "",
      status: (machine.status as "available" | "in_use" | "maintenance") || "available",
    });
    setIsCreateOpen(true);
  };

  const handleCreateComputer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newMachine.name.trim() || !newMachine.room.trim()) {
      return;
    }

    const token = getStoredSessionToken();
    if (!token) {
      window.alert("Bạn cần đăng nhập với quyền admin để quản lý máy");
      return;
    }

    try {
      const isEditing = editingMachineId !== null;
      const endpoint = isEditing ? `/api/computers/${editingMachineId}` : "/api/computers/create";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newMachine.name.trim(),
          room: newMachine.room.trim(),
          specs: newMachine.specs.trim() || null,
          status: newMachine.status,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? (isEditing ? "Không thể cập nhật máy" : "Không thể thêm máy"));
      }

      closeMachineModal();
      await loadData();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Không thể lưu máy");
    }
  };

  const handleDeleteComputer = async (computerId: number) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa máy này khỏi hệ thống?");
    if (!confirmed) {
      return;
    }

    const token = getStoredSessionToken();
    if (!token) {
      window.alert("Bạn cần đăng nhập với quyền admin để xóa máy");
      return;
    }

    try {
      const response = await fetch("/api/computers/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: computerId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message ?? "Xóa máy thất bại");
      }

      await loadData();
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : "Xóa máy thất bại");
    }
  };

  return (
    <MainLayout title={isAdmin ? "QLPL Demo" : "Đăng ký mượn máy"}>
      <div className="space-y-5 pb-8">
        {isAdmin ? (
          <>
            <section className="rounded-[28px] border border-[#dfe5ee] bg-[#f2f3f6] p-5 md:p-7 shadow-[0_8px_20px_rgba(15,23,42,0.02)]">
              <div className="flex items-start justify-between gap-4 md:items-center">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#7d8595]">OPERATIONS</p>
                  <h1 className="mt-3 text-[34px] font-bold tracking-[-0.05em] text-[#1d2433]">Quản lý máy tính</h1>
                  <p className="mt-2 max-w-2xl text-[14px] text-[#646f7d]">
                    Theo dõi phòng máy, trạng thái hoạt động và xử lý yêu cầu mượn trực tiếp từ hệ thống.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-2xl bg-gradient-to-r from-[#4d5ef6] to-[#6e5ae8] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(81,96,255,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(81,96,255,0.24)]"
                >
                  + Thêm máy
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[18px] border border-[#dfe5ee] bg-[#f7f8fa] px-4 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#6c7587]">
                      {item.label}
                    </p>
                    <p className={`mt-4 text-[42px] font-bold leading-none ${item.accent}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.6fr_0.95fr]">
              <div className="rounded-[28px] border border-[#dfe5ee] bg-[#f2f3f6] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.02)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-[20px] font-bold text-[#1d2433]">Danh sách máy trong phòng</h2>
                    <p className="text-sm text-[#7a8292]">Tổng quan trạng thái từng thiết bị</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="rounded-[18px] border border-[#dfe5ee] bg-white px-4 py-6 text-sm text-[#5e697b]">
                      Đang tải dữ liệu máy tính từ database...
                    </div>
                  ) : computers.length === 0 ? (
                    <div className="rounded-[18px] border border-[#dfe5ee] bg-white px-4 py-6 text-sm text-[#5e697b]">
                      Chưa có máy nào trong database.
                    </div>
                  ) : (
                    computers.map((machine) => {
                      const style = statusStyles[machine.status] ?? statusStyles.available;
                      return (
                        <div
                          key={machine.id}
                          className="flex items-center justify-between gap-4 rounded-[18px] border border-[#dfe5ee] bg-[#f8f9fb] px-4 py-4 shadow-[0_6px_14px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe8ff] text-[18px] font-semibold text-[#2f3e67]">
                              {machine.name.replace(/[^A-Z]/gi, "").slice(0, 1) || "M"}
                            </div>
                            <div>
                              <div className="text-[20px] font-bold tracking-[-0.04em] text-[#1e2430]">{machine.name}</div>
                              <div className="text-[13px] text-[#7a8292]">{machine.room}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${style.className}`}>
                              {style.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => openEditMachine(machine)}
                              className="rounded-full border border-[#dfe5ee] bg-white px-3 py-2 text-[12px] font-medium text-[#3b4556] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8fa8ff] hover:text-[#283d85]"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteComputer(machine.id)}
                              className="rounded-full border border-[#f4c7c7] bg-[#fff1f1] px-3 py-2 text-[12px] font-medium text-[#d14343] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffe5e5]"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#dfe5ee] bg-[#f2f3f6] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.02)]">
                <div className="mb-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7d8595]">REQUEST</p>
                  <h3 className="mt-2 text-[20px] font-bold text-[#1c2431]">Đăng ký mượn máy</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[12px] font-medium text-[#475569]">Chọn máy</label>
                    <select
                      value={selectedComputerId}
                      onChange={(event) => setSelectedComputerId(event.target.value)}
                      className="w-full rounded-xl border border-[#dfe5ee] bg-white px-4 py-3 text-[15px] text-[#455164] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                    >
                      <option value="">-- Chọn máy --</option>
                      {computers.map((computer) => (
                        <option key={computer.id} value={computer.id}>
                          {computer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-medium text-[#475569]">Lý do mượn</label>
                    <textarea
                      rows={5}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="w-full resize-none rounded-xl border border-[#dfe5ee] bg-white px-4 py-3 text-[15px] text-[#455164] outline-none placeholder:text-[#8a93a4] transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                      placeholder="Ví dụ: cần làm bài tập, demo, học thực hành..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRequest}
                    disabled={!selectedComputerId}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#4f5ef7] to-[#7a5cf0] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_10px_22px_rgba(83,96,255,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(83,96,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Gửi yêu cầu mượn
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#dfe5ee] bg-[#f3f4f7] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#7d8595]">APPROVAL</p>
                  <h2 className="mt-2 text-[22px] font-bold text-[#1c2431]">Yêu cầu mượn máy</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "pending", label: "Chờ duyệt" },
                    { value: "approved", label: "Đã duyệt" },
                    { value: "rejected", label: "Từ chối" },
                    { value: "returned", label: "Đã trả" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRequestFilter(option.value as typeof requestFilter)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                        requestFilter === option.value
                          ? "bg-[#4f5ef7] text-white shadow-[0_8px_18px_rgba(83,96,255,0.22)]"
                          : "border border-[#dfe5ee] bg-white text-[#475569] hover:border-[#8fa8ff] hover:text-[#283d85]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[18px] border border-[#dfe5ee] bg-white">
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="bg-[#f8fafc] text-[#5a6475]">
                      <th className="px-4 py-3 font-semibold">Máy</th>
                      <th className="px-4 py-3 font-semibold">Người yêu cầu</th>
                      <th className="px-4 py-3 font-semibold">Lý do</th>
                      <th className="px-4 py-3 font-semibold">Trạng thái</th>
                      <th className="px-4 py-3 font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-[#5e697b]">
                          Chưa có yêu cầu nào trong database.
                        </td>
                      </tr>
                    ) : (
                      approvalRows.map((row, index) => (
                        <tr key={`${row.machine}-${row.request}-${index}`} className="border-t border-[#edf2f7] transition-colors duration-200 hover:bg-[#f8faff]">
                          <td className="px-4 py-4 text-[#364152]">{row.machine}</td>
                          <td className="px-4 py-4 text-[#364152]">{row.request}</td>
                          <td className="px-4 py-4 text-[#364152]">{row.reason}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${row.statusClass}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#364152]">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleRequestStatus(Number(row.id), "approved")}
                                className="rounded-full bg-[#dff7e8] px-2.5 py-1 text-[11px] font-semibold text-[#188a51] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d0f0df]"
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestStatus(Number(row.id), "rejected")}
                                className="rounded-full bg-[#fce7e7] px-2.5 py-1 text-[11px] font-semibold text-[#e11d48] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f8dede]"
                              >
                                Từ chối
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestStatus(Number(row.id), "returned")}
                                className="rounded-full bg-[#e8f1ff] px-2.5 py-1 text-[11px] font-semibold text-[#1d4ed8] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#dfeaff]"
                              >
                                Đã trả
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="rounded-[28px] border border-[#dfe5ee] bg-[#f3f4f7] p-5 md:p-7 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#7d8595]">USER PORTAL</p>
                  <h1 className="mt-3 text-[34px] font-bold tracking-[-0.04em] text-[#1c2431]">
                    Quản lý máy tính - Chế độ xem
                  </h1>
                  <p className="mt-2 text-[14px] text-[#646f7d]">
                    Bạn chỉ được xem trạng thái và số lượng máy tính. Không có quyền thêm, sửa hoặc xóa máy.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full border border-[#dfe5ee] bg-white px-3 py-1.5 text-[12px] font-medium text-[#475569]">
                  Chỉ xem
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[18px] border border-[#dfe5ee] bg-[#f7f8fa] px-4 py-4 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#6c7587]">
                      {item.label}
                    </p>
                    <p className={`mt-4 text-[42px] font-bold leading-none ${item.accent}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_1.4fr]">
              <div className="rounded-[28px] border border-[#dfe5ee] bg-[#f3f4f7] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
                <div className="mb-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7d8595]">MACHINES</p>
                  <h3 className="mt-2 text-[20px] font-bold text-[#1c2431]">Danh sách máy</h3>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="rounded-[18px] border border-[#dfe5ee] bg-white px-4 py-6 text-sm text-[#5e697b]">
                      Đang tải thông tin máy tính...
                    </div>
                  ) : computers.length === 0 ? (
                    <div className="rounded-[18px] border border-[#dfe5ee] bg-white px-4 py-6 text-sm text-[#5e697b]">
                      Chưa có máy nào trong hệ thống.
                    </div>
                  ) : (
                    computers.map((machine) => {
                      const style = statusStyles[machine.status] ?? statusStyles.available;
                      return (
                        <div
                          key={machine.id}
                          className="rounded-[18px] border border-[#dfe5ee] bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.02)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[18px] font-bold text-[#1c2431]">{machine.name}</div>
                              <div className="mt-1 text-[13px] text-[#7a8292]">{machine.room}</div>
                            </div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${style.className}`}>
                              {style.label}
                            </span>
                          </div>
                          {machine.specs ? <p className="mt-3 text-[14px] text-[#455164]">{machine.specs}</p> : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#dfe5ee] bg-[#f3f4f7] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
                <div className="mb-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7d8595]">REQUEST</p>
                  <h3 className="mt-2 text-[20px] font-bold text-[#1c2431]">Gửi yêu cầu</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-[12px] font-medium text-[#475569]">Chọn máy</label>
                    <select
                      value={selectedComputerId}
                      onChange={(event) => setSelectedComputerId(event.target.value)}
                      className="w-full rounded-xl border border-[#dfe5ee] bg-white px-4 py-3 text-[15px] text-[#455164] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                    >
                      <option value="">-- Chọn máy --</option>
                      {computers.map((computer) => (
                        <option key={computer.id} value={computer.id}>
                          {computer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[12px] font-medium text-[#475569]">Lý do mượn</label>
                    <textarea
                      rows={5}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="w-full resize-none rounded-xl border border-[#dfe5ee] bg-white px-4 py-3 text-[15px] text-[#455164] outline-none placeholder:text-[#8a93a4] transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                      placeholder="Ví dụ: cần làm bài tập, demo, học thực hành..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateRequest}
                    disabled={!selectedComputerId}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#4f5ef7] to-[#7a5cf0] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_10px_22px_rgba(83,96,255,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(83,96,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Gửi yêu cầu mượn
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#dfe5ee] bg-[#f3f4f7] p-4 md:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#7d8595]">MY REQUESTS</p>
                  <h3 className="mt-2 text-[20px] font-bold text-[#1c2431]">Yêu cầu của tôi</h3>
                </div>
              </div>

              <div className="space-y-3">
                {myRequests.length === 0 ? (
                  <div className="rounded-[18px] border border-[#dfe5ee] bg-white px-4 py-6 text-sm text-[#5e697b]">
                    Bạn chưa có yêu cầu mượn máy nào.
                  </div>
                ) : (
                  myRequests.map((request) => {
                    const machine = computers.find((computer) => computer.id === request.computer_id);
                    const style = statusStyles[request.status] ?? statusStyles.pending;

                    return (
                      <div key={request.id} className="rounded-[18px] border border-[#dfe5ee] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(15,23,42,0.04)]">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[18px] font-bold text-[#1c2431]">{machine?.name ?? "Máy"}</div>
                            <div className="mt-1 text-[13px] text-[#7a8292]">{request.requested_at ? new Date(request.requested_at).toLocaleString("vi-VN") : "-"}</div>
                          </div>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-medium ${style.className}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="mt-3 text-[14px] text-[#455164]">{request.reason || "Không có lý do"}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-[#dfe5ee] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#7d8595]">MACHINE</p>
                <h3 className="mt-2 text-[24px] font-bold text-[#1c2431]">
                  {editingMachineId !== null ? "Cập nhật máy" : "Thêm máy mới"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeMachineModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe5ee] text-lg text-[#485569] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8fa8ff] hover:text-[#283d85]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateComputer} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">Tên máy</label>
                <input
                  value={newMachine.name}
                  onChange={(event) => setNewMachine((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3 text-[#1c2431] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                  placeholder="VD: M05"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">Phòng</label>
                <input
                  value={newMachine.room}
                  onChange={(event) => setNewMachine((current) => ({ ...current, room: event.target.value }))}
                  className="w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3 text-[#1c2431] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                  placeholder="VD: C201"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">Cấu hình</label>
                <input
                  value={newMachine.specs}
                  onChange={(event) => setNewMachine((current) => ({ ...current, specs: event.target.value }))}
                  className="w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3 text-[#1c2431] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                  placeholder="VD: Intel i7, 16GB RAM, SSD 512GB"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">Trạng thái</label>
                <select
                  value={newMachine.status}
                  onChange={(event) =>
                    setNewMachine((current) => ({
                      ...current,
                      status: event.target.value as "available" | "in_use" | "maintenance",
                    }))
                  }
                  className="w-full rounded-xl border border-[#dfe5ee] bg-[#f8fafc] px-4 py-3 text-[#1c2431] outline-none transition-colors duration-200 focus:border-[#7c9cff] hover:border-[#c4d1ff]"
                >
                  <option value="available">Có sẵn</option>
                  <option value="in_use">Đang sử dụng</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeMachineModal}
                  className="rounded-xl border border-[#dfe5ee] bg-white px-4 py-2.5 text-sm font-medium text-[#475569] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8fa8ff] hover:text-[#283d85]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-[#4f5ef7] to-[#7a5cf0] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(83,96,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(83,96,255,0.28)]"
                >
                  {editingMachineId !== null ? "Cập nhật" : "Lưu máy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
