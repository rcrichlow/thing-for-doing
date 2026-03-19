# frozen_string_literal: true

class BoardsController < ApplicationController
  def index
    boards = Board.includes(lists: :cards).all
    render json: serialize_boards(boards)
  end

  def show
    board = Board.includes(lists: :cards).find(params[:id])
    render json: serialize_boards(board)
  end

  def create
    board = Board.new(board_params)
    if board.save
      render json: serialize_boards(board), status: :created
    else
      render_validation_errors(board)
    end
  end

  def update
    board = Board.includes(lists: :cards).find(params[:id])
    if board.update(board_params)
      render json: serialize_boards(board)
    else
      render_validation_errors(board)
    end
  end

  def destroy
    board = Board.find(params[:id])
    board.destroy
    head :no_content
  end

  private

  def board_params
    params.require(:board).permit(:title)
  end

  def serialize_boards(records)
    if records.respond_to?(:to_ary)
      records.map { |board| serialize_board(board) }
    else
      serialize_board(records)
    end
  end

  def serialize_board(board)
    board.as_json(
      include: {
        lists: {
          include: :cards
        }
      }
    ).tap do |payload|
      payload['lists'] = ordered_records(board.lists).map do |list|
        list.as_json(include: :cards).tap do |list_payload|
          list_payload['cards'] = ordered_records(list.cards).map(&:as_json)
        end
      end
    end
  end

  def ordered_records(records)
    Array(records).sort_by { |record| [record.position || 0, record.id] }
  end
end
