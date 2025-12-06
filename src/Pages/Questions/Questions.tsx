import React, { useState } from "react";
import { Layout } from "../../Components/Common/Layout/Layout";
import { Filter, Plus } from "lucide-react";
import Table from "../../Components/Common/Table/Table";
import type { Column } from "../../Components/Common/Table/Table";
import Pagination from "../../Components/Common/Table/Pagination";
import QuestionModal from "../../Components/Common/Modal/QuestionModal";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import type { Question } from "../../Types/Question";
import { useQuestions } from "../../Hooks/useQuestions";
import { useToast } from "../../Contexts/ToastContext";
import { getErrorMessage } from "../../Utils/errorHandler";
import { useAuth } from "../../Contexts/AuthContext";

type QuestionWithId = Question & { id: string };

const Questions: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithId | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionWithId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const toast = useToast();
  const { user } = useAuth();
  const { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } = useQuestions();

  const { data: questionsData, isLoading, error } = fetchQuestions(currentPage, itemsPerPage);
  const { mutate: createQuestionMutation, isPending: isCreating } = createQuestion();
  const { mutate: updateQuestionMutation, isPending: isUpdating } = updateQuestion();

  const questionsWithId: QuestionWithId[] = (questionsData?.items || []).map((question: Question) => ({
    ...question,
    id: question.public_id
  }));

  const filteredQuestions = questionsWithId.filter((question) => {
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      question.question_number.toLowerCase().includes(lowerSearchTerm) ||
      question.description.toLowerCase().includes(lowerSearchTerm) ||
      question.field_type.toLowerCase().includes(lowerSearchTerm) ||
      question.response_type.toLowerCase().includes(lowerSearchTerm)
    );
  });

  const columns: Column<QuestionWithId>[] = [
    {
      key: 'question_number',
      header: 'Número',
      render: (question) => (
        <div className="text-sm font-medium text-gray-900">{question.question_number}</div>
      )
    },
    {
      key: 'description',
      header: 'Descrição',
      render: (question) => (
        <div className="text-sm text-gray-900 truncate max-w-xs">{question.description}</div>
      )
    },
    {
      key: 'field_type',
      header: 'Tipo de Campo',
      hideOnMobile: true,
      render: (question) => (
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {question.field_type === 'texto_curto' && 'Texto Curto'}
            {question.field_type === 'texto_longo' && 'Texto Longo'}
            {question.field_type === 'select' && 'Select'}
            {question.field_type === 'boolean' && 'Sim/Não'}
          </span>
        </div>
      )
    },
    {
      key: 'response_type',
      header: 'Tipo de Resposta',
      hideOnTablet: true,
      render: (question) => (
        <div className="text-sm text-gray-500">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            question.response_type === 'obrigatoria'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {question.response_type === 'obrigatoria' ? 'Obrigatória' : 'Condicional'}
          </span>
        </div>
      )
    },
    {
      key: 'roles',
      header: 'Roles',
      hideOnMobile: true,
      render: (question) => (
        <div className="text-sm text-gray-500">
          {question.roles.length} {question.roles.length === 1 ? 'role' : 'roles'}
        </div>
      )
    }
  ];

  const handleView = (question: QuestionWithId) => {
    setSelectedQuestion(question);
    setIsViewMode(true);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (question: QuestionWithId) => {
    setSelectedQuestion(question);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDelete = (question: QuestionWithId) => {
    setQuestionToDelete(question);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteQuestion(questionToDelete.public_id);
      toast.success('Questão excluída', 'Questão excluída com sucesso!');
      setIsConfirmationOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      toast.error('Erro ao excluir', getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
    setQuestionToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewQuestion = () => {
    setSelectedQuestion(null);
    setIsViewMode(false);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
    setIsViewMode(false);
    setIsEditMode(false);
  };

  const handleSubmitQuestion = (data: {
    question_number: string;
    description: string;
    field_type: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
    response_type: 'obrigatoria' | 'condicional';
    roles: string[];
    condition: string | null;
    options: string[] | null;
    category_id: string | null;
    hospital_id?: string;
  }) => {
    // Adicionar hospital_id do usuário logado
    const processedData = {
      ...data,
      hospital_id: user?.hospital?.public_id
    };

    if (isEditMode && selectedQuestion) {
      updateQuestionMutation(
        { id: selectedQuestion.public_id, data: processedData },
        {
          onSuccess: () => {
            toast.success('Questão atualizada', 'Questão atualizada com sucesso!');
            setIsModalOpen(false);
            setSelectedQuestion(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            console.error('Erro ao atualizar questão:', error);
            toast.error('Erro ao atualizar', getErrorMessage(error));
          }
        }
      );
    } else {
      createQuestionMutation(processedData, {
        onSuccess: () => {
          toast.success('Questão criada', 'Questão criada com sucesso!');
          setIsModalOpen(false);
        },
        onError: (error) => {
          console.error('Erro ao criar questão:', error);
          toast.error('Erro ao criar', getErrorMessage(error));
        }
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar questões</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar questões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtrar</span>
              </button>
              <button
                onClick={handleNewQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Questão</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando...</div>
            </div>
          ) : (
            <>
              <Table<QuestionWithId>
                data={filteredQuestions}
                columns={columns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                emptyMessage={searchTerm ? "Nenhuma questão encontrada com esse termo" : "Nenhuma questão encontrada"}
              />
              {!searchTerm && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={questionsData?.total || 0}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>

      <QuestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitQuestion}
        mode={isViewMode ? 'view' : isEditMode ? 'edit' : 'create'}
        initialData={selectedQuestion ? {
          question_number: selectedQuestion.question_number,
          description: selectedQuestion.description,
          field_type: selectedQuestion.field_type,
          response_type: selectedQuestion.response_type,
          roles: selectedQuestion.roles,
          condition: selectedQuestion.condition,
          options: selectedQuestion.options,
          category_id: selectedQuestion.category_id,
          category_name: selectedQuestion.category?.name,
          hospital_id: selectedQuestion.hospital_id
        } : undefined}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Questão"
        message={`Tem certeza que deseja excluir a questão "${questionToDelete?.question_number}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </Layout>
  );
};

export default Questions;
