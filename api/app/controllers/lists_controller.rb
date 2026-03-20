# frozen_string_literal: true

class ListsController < ApplicationController
  def create
    board = Board.find(params[:board_id])
    list = board.lists.new(list_params)
    if list.save
      render json: serialize_list(list), status: :created
    else
      render_validation_errors(list)
    end
  end

  def update
    list = List.includes(:cards).find(params[:id])
    if list.update(list_params)
      render json: serialize_list(list)
    else
      render_validation_errors(list)
    end
  end

  def destroy
    list = List.includes(:cards, :board).find(params[:id])
    target_list = transfer_target_for(list)

    if invalid_transfer_target?(destroy_params[:transfer_list_id], target_list)
      return render_invalid_transfer_target(list)
    end

    destroy_list_with_optional_transfer!(list, target_list)

    head :no_content
  end

  private

  def list_params
    params.require(:list).permit(:title, :position)
  end

  def destroy_params
    params.fetch(:list, {}).permit(:transfer_list_id)
  end

  def transfer_target_for(list)
    transfer_list_id = destroy_params[:transfer_list_id]
    return if transfer_list_id.blank?

    list.board.lists.where.not(id: list.id).find_by(id: transfer_list_id)
  end

  def invalid_transfer_target?(transfer_list_id, target_list)
    transfer_list_id.present? && target_list.nil?
  end

  def render_invalid_transfer_target(list)
    list.errors.add(:base, 'Transfer list must belong to the same board')
    render_validation_errors(list)
  end

  def destroy_list_with_optional_transfer!(list, target_list)
    return list.destroy! unless target_list

    List.transaction do
      transfer_cards!(list, target_list)
      list.association(:cards).reset
      list.destroy!
    end
  end

  def transfer_cards!(list, target_list)
    target_cards = ordered_records(target_list.cards)
    transferred_cards = ordered_records(list.cards)

    transferred_cards.each do |card|
      card.update_columns(list_id: target_list.id)
    end

    Card.normalize_scope_positions(target_cards + transferred_cards)
  end

  def serialize_list(list)
    list.as_json(include: :cards).tap do |payload|
      payload['cards'] = ordered_records(list.cards).map(&:as_json)
    end
  end
end
